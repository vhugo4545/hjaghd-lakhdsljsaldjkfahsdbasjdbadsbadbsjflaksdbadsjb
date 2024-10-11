buscarClientes()

// Função para buscar clientes
async function buscarClientes() {
    try {
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/clientes/visualizar');
        if (!response.ok) {
            throw new Error('Erro ao buscar os clientes');
        }

        const data = await response.json();
        const clientes = data.map(cliente => ({
            label: cliente.nome_fantasia,
            value: cliente.codigo_cliente_omie,
            cnpj_cpf: cliente.cnpj_cpf,
            endereco: cliente.endereco,
            telefone: cliente.telefone2_numero
        }));

        $("#nome").autocomplete({
            source: clientes,
            select: function (event, ui) {
                $("#nome").val(ui.item.label);
                preencherCamposCliente(ui.item);
                return false;
            }
        });

    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
    }
}

// Função para preencher os campos do formulário com os dados do cliente
function preencherCamposCliente(cliente) {
    document.getElementById('cpfCnpj').value = cliente.cnpj_cpf || '';
    document.getElementById('endereco').value = cliente.endereco || '';
    document.getElementById('telefone').value = cliente.telefone || '';
    document.getElementById('idClienteOmie').value = cliente.value || '';
}

// Função para pesquisar ambientes
async function pesquisarAmbiente() {
    const pesquisa = document.getElementById('ambienteSelecionado').value.toLowerCase();
    const ambienteSuggestions = document.getElementById('ambienteSuggestions');

    ambienteSuggestions.innerHTML = '';

    if (pesquisa === '') {
        ambienteSuggestions.style.display = 'none';
        return;
    } else {
        ambienteSuggestions.style.display = 'block';
    }

    try {
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/ambientes');
        if (!response.ok) {
            throw new Error('Erro ao buscar os ambientes');
        }

        const ambientes = await response.json();
        const ambientesFiltrados = ambientes.filter(ambiente =>
            ambiente.nome.toLowerCase().includes(pesquisa)
        );

        ambientesFiltrados.forEach(ambiente => {
            const div = document.createElement('div');
            div.classList.add('item-autocomplete');
            div.textContent = ambiente.nome;
            div.onclick = function () {
                document.getElementById('ambienteSelecionado').value = ambiente.nome;
                ambienteSuggestions.style.display = 'none';
            };
            ambienteSuggestions.appendChild(div);
        });

        if (ambientesFiltrados.length === 0) {
            const div = document.createElement('div');
            div.classList.add('item-autocomplete');
            div.innerHTML = `<strong>Cadastrar novo ambiente: "${pesquisa}"</strong>`;
            div.onclick = function () {
                cadastrarAmbiente(pesquisa);
                ambienteSuggestions.style.display = 'none';
            };
            ambienteSuggestions.appendChild(div);
        }
    } catch (error) {
        console.error('Erro ao buscar ambientes:', error);
    }
}

// Função para cadastrar um novo ambiente
async function cadastrarAmbiente(nomeAmbiente) {
    try {
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/ambientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: nomeAmbiente }),
        });

        if (!response.ok) {
            throw new Error('Erro ao cadastrar o ambiente');
        }

        const novoAmbiente = await response.json();
        alert(`Ambiente "${novoAmbiente.nome}" cadastrado com sucesso!`);
        document.getElementById('ambienteSelecionado').value = novoAmbiente.nome;

    } catch (error) {
        console.error('Erro ao cadastrar o ambiente:', error);
        alert('Não foi possível cadastrar o ambiente.');
    }
}

// Função para filtrar e exibir os produtos na tabela de pesquisa
async function filtrarProdutos() {
    const pesquisa = document.getElementById('pesquisaProduto').value.toLowerCase();
    const tabelaProdutos = document.getElementById('tabelaProdutos');
    const divTabelaProdutos = document.getElementById('divTabelaProdutos');

    tabelaProdutos.innerHTML = '';

    if (pesquisa === '') {
        divTabelaProdutos.style.display = 'none';
        return;
    } else {
        divTabelaProdutos.style.display = 'block';
    }

    try {
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/produtos/visualizar');
        if (!response.ok) {
            throw new Error('Erro ao buscar os produtos');
        }

        const produtos = await response.json();
        const produtosFiltrados = produtos.filter(produto =>
            produto.descricao.toLowerCase().includes(pesquisa) ||
            produto.codigo.toLowerCase().includes(pesquisa)
        );

        function incluirProdutosSelecionados() {
    const ambienteSelecionado = document.getElementById('ambienteSelecionado').value;

    if (ambienteSelecionado === '') {
        alert('Por favor, selecione um ambiente para adicionar produtos.');
        return;
    }

    let tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    if (!tabelaAmbiente) {
        criarTabelaAmbiente(ambienteSelecionado);
        tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    }

    const checkboxes = document.querySelectorAll('.checkbox-selecionar-produto:checked');
    if (checkboxes.length === 0) {
        alert('Nenhum produto selecionado.');
        return;
    }

    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const nomeProduto = row.querySelector('.produto-nome').textContent;
        const codigoProduto = row.querySelector('td:nth-child(4)').textContent;
        const codigoInterno = row.querySelector('td:nth-child(5)').textContent;
        const valorUnitario = parseFloat(row.querySelector('td:nth-child(6)').textContent.replace('R$ ', ''));
        const imagemUrl = row.querySelector('img') ? row.querySelector('img').src : '';

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
            <td>${nomeProduto}</td>
            <td>${codigoProduto}</td>
            <td>${codigoInterno}</td>
            <td style="white-space: nowrap;">R$ <span class="valorUnitario">${valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
            <td><input type="number" class="form-control quantidadeProduto" min="1" value="1" onchange="atualizarTodosOsCalculos('${ambienteSelecionado}')"></td>
            <td style="white-space: nowrap;">R$ <span class="valorTotal">${valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
            <td>
                <i class="fa fa-question-circle" style="cursor: pointer; color: blue;" onclick="adicionarObservacao(this)" title="Adicionar Observação"></i>
                <i class="fa fa-trash" style="cursor: pointer; color: red; margin-left: 10px;" onclick="removerProduto(this, '${ambienteSelecionado}')" title="Remover Produto"></i>
            </td>
        `;
        tabelaAmbiente.querySelector('tbody').appendChild(newRow);
        
        
    });

    // Reaplicar o sortable para garantir que todos os produtos sejam arrastáveis
    $(`#tabela-${ambienteSelecionado} tbody`).sortable({
        placeholder: "ui-state-highlight",
        axis: "y",
        handle: "tr"
    }).disableSelection();

    atualizarTodosOsCalculos(ambienteSelecionado);
}

produtosFiltrados.forEach(produto => {
    const imagemUrl = produto.imagens && produto.imagens.length > 0 ? produto.imagens[0].url_imagem : '';
    const imagemHtml = imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto" class="produto-imagem" style="cursor: pointer; max-width: 50px;" onclick="abrirImagem('${imagemUrl}')">` : '<span>Sem imagem</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" class="checkbox-selecionar-produto" value="${produto.codigo_produto}"></td>
        <td>${imagemHtml}</td>
        <td class="produto-nome">${produto.descricao}</td>
        <td>${produto.codigo}</td>
        <td>${produto.codigo_produto}</td>
        <td style="white-space: nowrap;">${produto.valor_unitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        <td><i class="fa fa-eye" style="cursor: pointer;" onclick="verDetalhes('${produto.descr_detalhada}')"></i></td>
    `;
    tabelaProdutos.appendChild(row);
});

        

        // Tornar os itens arrastáveis dentro da tabela de produtos
        $("#tabelaProdutos").sortable();
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
    }
}

// Função para criar uma nova tabela para um ambiente específico

function criarTabelaAmbiente(ambiente) {
    const tabelasAmbientesDiv = document.getElementById('tabelasAmbientes');

    const tabelaDiv = document.createElement('div');
    tabelaDiv.classList.add('mt-4', 'ambiente-container');
    tabelaDiv.setAttribute('id', `div-${ambiente}`);
    tabelaDiv.innerHTML = `
        <h4 class="text-center text-uppercase" style="font-weight: bold;">
            ${ambiente} 
            <button class="btn btn-sm btn-danger" onclick="removerAmbiente('${ambiente}')">Excluir Ambiente</button>
        </h4>
        <table class="table table-bordered" id="tabela-${ambiente}">
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Código</th>
                    <th>Código Interno</th>
                    <th>Valor Unitário</th>
                    <th>QT</th>
                    <th>Valor Total</th>
                    <th>Ação</th>
                </tr>
            </thead>
            <tbody>
                <!-- Produtos serão adicionados aqui -->
            </tbody>
        </table>
        <div class="total-ambiente-bar" id="total-${ambiente}">Total do Ambiente: R$ 0,00</div>
    `;
    tabelasAmbientesDiv.appendChild(tabelaDiv);

    // Tornar os produtos dentro da tabela arrastáveis
    $(`#tabela-${ambiente} tbody`).sortable({
        placeholder: "ui-state-highlight",
        axis: "y",
        handle: "tr"
    }).disableSelection();
}


function atualizarTodosOsCalculos(ambiente) {
    const tabelaAmbiente = document.getElementById(`tabela-${ambiente}`);
    let totalAmbiente = 0;

    tabelaAmbiente.querySelectorAll('tr').forEach(row => {
        const valorUnitarioElement = row.querySelector('.valorUnitario');
        const quantidadeElement = row.querySelector('.quantidadeProduto');
        const valorTotalElement = row.querySelector('.valorTotal');

        if (valorUnitarioElement && quantidadeElement && valorTotalElement) {
            // Extrair o valor numérico do valor unitário e quantidade
            let valorUnitario = valorUnitarioElement.textContent.replace(/[^\d,.-]/g, '').replace(',', '.');
            valorUnitario = parseFloat(valorUnitario);
            const quantidade = parseFloat(quantidadeElement.value);
            
            if (!isNaN(valorUnitario) && !isNaN(quantidade) && quantidade > 0) {
                const novoValorTotal = valorUnitario * quantidade;
                valorTotalElement.textContent = novoValorTotal.toFixed(2);
                totalAmbiente += novoValorTotal;
            } else {
                valorTotalElement.textContent = '0.00';
            }
        }
    });

    document.getElementById(`total-${ambiente}`).textContent = `Total do Ambiente: ${totalAmbiente.toFixed(2)}`;
    atualizarTotalGeral();
}




function incluirProdutoGenerico() {
    const ambienteSelecionado = document.getElementById('ambienteSelecionado').value;

    if (ambienteSelecionado === '') {
        alert('Por favor, selecione um ambiente para adicionar um produto.');
        return;
    }

    let tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    if (!tabelaAmbiente) {
        criarTabelaAmbiente(ambienteSelecionado);
        tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="form-control" placeholder="Imagem URL" onchange="atualizarImagemProduto(this)"></td>
        <td><input type="text" class="form-control produto-nome" placeholder="Nome do Produto"></td>
        <td>101020</td>
        <td>101020</td>
        <td style="white-space: nowrap;">R$ <input type="number" class="form-control valorUnitario" min="0" step="0.01" placeholder="Valor Unitário" onchange="atualizarValorTotalGenerico(this)"></td>
        <td><input type="number" class="form-control quantidadeProduto" min="1" value="1" onchange="atualizarValorTotalGenerico(this)"></td>
        <td style="white-space: nowrap;">R$ <span class="valorTotal">0.00</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="removerProduto(this, '${ambienteSelecionado}')">Remover</button></td>
    `;
    tabelaAmbiente.querySelector('tbody').appendChild(row);

    // Reaplicar o sortable para garantir que todos os produtos sejam arrastáveis
    $(`#tabela-${ambienteSelecionado} tbody`).sortable({
        placeholder: "ui-state-highlight",
        axis: "y",
        handle: "tr"
    }).disableSelection();

    atualizarTodosOsCalculos(ambienteSelecionado);
}

function atualizarImagemProduto(input) {
    const url = input.value;
    const cell = input.closest('td');

    if (url) {
        cell.innerHTML = `<img src="${url}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">`;
    }
}

function atualizarValorTotalGenerico(input) {
    const row = input.closest('tr');
    const valorUnitario = parseFloat(row.querySelector('.valorUnitario').value);
    const quantidade = parseFloat(row.querySelector('.quantidadeProduto').value);
    const valorTotalElement = row.querySelector('.valorTotal');

    if (!isNaN(valorUnitario) && !isNaN(quantidade) && quantidade > 0) {
        const novoValorTotal = valorUnitario * quantidade;
        valorTotalElement.textContent = novoValorTotal.toFixed(2);
    }

    // Atualizar a linha para parecer idêntica às outras após o preenchimento
    row.querySelectorAll('input').forEach(input => {
        const value = input.value;
        const cell = input.closest('td');
        cell.textContent = value;
    });

    atualizarTodosOsCalculos(input.closest('table').id.replace('tabela-', ''));
}


function atualizarImagemProduto(input) {
    const url = input.value;
    const cell = input.closest('td');

    if (url) {
        cell.innerHTML = `Sem Foto`;
    }
}

// Função para atualizar o valor total dos produtos de acordo com a quantidade
function atualizarValorTotalProdutos(ambiente) {
    const tabelaAmbiente = document.getElementById(`tabela-${ambiente}`);
    tabelaAmbiente.querySelectorAll('tr').forEach(row => {
        const valorUnitario = parseFloat(row.querySelector('.valorUnitario').textContent);
        const quantidade = parseFloat(row.querySelector('.quantidadeProduto').value);
        const valorTotalElement = row.querySelector('.valorTotal');
        
        if (!isNaN(valorUnitario) && !isNaN(quantidade) && quantidade > 0) {
            const novoValorTotal = valorUnitario * quantidade;
            valorTotalElement.textContent = novoValorTotal.toFixed(2);
        }
    });
}

// Função para atualizar o total do ambiente 1
function atualizarTotalAmbiente(ambiente) {
    let total = 0;
    const tabelaAmbiente = document.getElementById(`tabela-${ambiente}`);
    tabelaAmbiente.querySelectorAll('.valorTotal').forEach(element => {
        total += parseFloat(element.textContent.replace(/[^\d,.-]/g, '').replace(',', '.'));
    });

    document.getElementById(`total-${ambiente}`).textContent = `Total do Ambiente: R$ ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    atualizarTotalGeral();
}


// Função para remover produto da tabela e atualizar todos os cálculos 1 
function removerProduto(icon, ambiente) {
    const confirmarRemocao = confirm("Você tem certeza que deseja remover este produto?");
    if (!confirmarRemocao) return;

    const row = icon.closest('tr');
    let obsRow = row.nextElementSibling;

    // Remover a linha de observação associada, se existir
    if (obsRow && obsRow.classList.contains('observacao-row')) {
        obsRow.remove();
    }

    // Remover a linha do produto
    row.remove();

    // Atualizar os cálculos
    atualizarTodosOsCalculos(ambiente);
    atualizarTotalGeral();
}








function adicionarAoOrcamento(nomeProduto, codigoProduto, valorProduto, imagemUrl, codigoInterno) {
    const ambienteSelecionado = document.getElementById('ambienteSelecionado').value;

    if (ambienteSelecionado === '') {
        alert('Por favor, selecione um ambiente para o produto.');
        return;
    }

    let tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    if (!tabelaAmbiente) {
        criarTabelaAmbiente(ambienteSelecionado);
        tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
        <td>${nomeProduto}</td>
        <td>${codigoProduto}</td>
        <td>${codigoInterno}</td>
        <td style="white-space: nowrap;">R$ <span class="valorUnitario">${valorProduto.toFixed(2)}</span></td>
        <td><input type="number" class="form-control quantidadeProduto" min="1" value="1" onchange="atualizarTodosOsCalculos('${ambienteSelecionado}')"></td>
        <td style="white-space: nowrap;">R$ <span class="valorTotal">${valorProduto.toFixed(2)}</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="removerProduto(this, '${ambienteSelecionado}')">Remover</button></td>
    `;
    tabelaAmbiente.querySelector('tbody').appendChild(row);

    // Reaplicar o sortable para garantir que todos os produtos sejam arrastáveis
    $(`#tabela-${ambienteSelecionado} tbody`).sortable({
        placeholder: "ui-state-highlight",
        axis: "y",
        handle: "tr"
    }).disableSelection();

    atualizarTodosOsCalculos(ambienteSelecionado);
}


// Função para atualizar o valor total do produto com base na quantidade
function atualizarValorTotal(input, valorUnitario) {
    const quantidade = parseFloat(input.value);
    const valorTotalElement = input.closest('tr').querySelector('.valorTotal');

    if (!isNaN(quantidade) && quantidade > 0) {
        const novoValorTotal = valorUnitario * quantidade;
        valorTotalElement.textContent = novoValorTotal.toFixed(2);
    }
}

function atualizarTotalGeral() {
    let totalGeral = 0;

    // Iterar por cada elemento que contém o total de um ambiente
    document.querySelectorAll('.total-ambiente-bar').forEach(element => {
        // Remover todos os caracteres não numéricos e substituir vírgulas por pontos
        let totalAmbienteText = element.textContent.replace(/[^\d.-]/g, '').replace(',', '.');

        // Converter para float
        const totalAmbiente = parseFloat(totalAmbienteText);

        // Se o valor for válido, somá-lo ao total geral
        if (!isNaN(totalAmbiente)) {
            totalGeral += totalAmbiente;
        }
    });

    // Atualizar o valor total geral, formatando-o corretamente
    document.getElementById('total-geral').textContent = `Total Geral: ${totalGeral.toFixed(2).replace('.', ',')}`;
}



// Função para remover um ambiente inteiro (tabela e produtos)
function removerAmbiente(ambiente) {
    const divAmbiente = document.getElementById(`div-${ambiente}`);
    if (divAmbiente) {
        divAmbiente.remove();
    }
}

// Função para visualizar os detalhes do produto em um alert
function verDetalhes(descricaoDetalhada) {
    alert(descricaoDetalhada);
}

// Função para abrir a imagem em um popup centralizado
function abrirImagem(urlImagem) {
    const popup = document.createElement('div');
    popup.className = 'image-popup';
    popup.innerHTML = `
        <span class="close-popup" onclick="fecharPopup()">&times;</span>
        <img src="${urlImagem}" alt="Imagem do Produto">
    `;
    document.body.appendChild(popup);
}

// Função para fechar o popup da imagem
function fecharPopup() {
    const popup = document.querySelector('.image-popup');
    if (popup) {
        popup.remove();
    }
}

const tituloOrcamento = document.getElementById('tituloOrcamento');
if (tituloOrcamento) {
    tituloOrcamento.textContent = `${nomeCliente} - ${dataAtual}`;
}
// Função para gerar o PDF do orçamento
async function gerarFolhaOrcamento() {
    // Obtém o nome do cliente e a data atual
    const nomeCliente = document.getElementById('nome') ? document.getElementById('nome').value : '';
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Atualiza o título da página de orçamento, se existir
    const tituloOrcamento = document.getElementById('tituloOrcamento');
    if (tituloOrcamento) {
        
    }

    // Ocultar todos os elementos desnecessários antes de gerar o PDF
    ocultarElementos();

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageHeight = pdf.internal.pageSize.getHeight();
        let currentPage = 0;

        // Captura o container do orçamento
        const container = document.getElementById('orcamentoContainer');
        if (!container) {
            console.error('Erro: elemento "orcamentoContainer" não encontrado.');
            return;
        }

        // Usar o html2canvas para capturar o conteúdo em partes
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgWidth = 210; // Largura do PDF A4 em mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let y = 0; // posição vertical inicial no PDF

        // Adicionar a imagem em partes
        while (y < imgHeight) {
            if (currentPage > 0) {
                pdf.addPage(); // adiciona uma nova página depois da primeira
            }
            pdf.addImage(imgData, 'JPEG', 0, y ? -y : 0, imgWidth, imgHeight);
            y += pageHeight; // move para a próxima seção vertical
            currentPage++;
        }

        pdf.save('orcamento.pdf');
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
        alert('Erro ao gerar o PDF. Tente novamente.');
    }

    // Mostrar todos os elementos novamente
    mostrarTudo();
}


// Tornar as tabelas dos ambientes e os produtos dentro delas reorganizáveis
$(document).ready(function () {
    // Torna as linhas dos produtos de cada tabela reorganizáveis
    $("#tabelasAmbientes").on("mouseenter", ".table.table-bordered tbody", function () {
        $(this).sortable({
            placeholder: "ui-state-highlight",
            axis: "y",
            handle: "tr",
            update: function (event, ui) {
                console.log(`Produto movido na tabela ${$(this).closest('table').attr('id')}`);
            }
        }).disableSelection();
    });

    // Torna os ambientes reorganizáveis
    $("#tabelasAmbientes").sortable({
        handle: "h4", // Arrasta usando o cabeçalho da tabela
        axis: "y",
        placeholder: "ui-state-highlight"
    });
});

function adicionarProdutoGenerico() {
    const ambienteSelecionado = document.getElementById('ambienteSelecionado').value;

    if (ambienteSelecionado === '') {
        alert('Por favor, selecione um ambiente para adicionar um produto.');
        return;
    }

    const nomeProduto = document.getElementById('produtoNome').value;
    const imagemUrl = document.getElementById('produtoImagemUrl').value;
    const valorUnitario = parseFloat(document.getElementById('produtoValorUnitario').value);
    const quantidade = parseInt(document.getElementById('produtoQuantidade').value);

    if (!nomeProduto || isNaN(valorUnitario) || isNaN(quantidade) || quantidade <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    let tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    if (!tabelaAmbiente) {
        criarTabelaAmbiente(ambienteSelecionado);
        tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
    }

    const valorTotal = valorUnitario * quantidade;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
        <td>${nomeProduto}</td>
        <td>101020</td>
        <td>101020</td>
        <td style="white-space: nowrap;">R$ <span class="valorUnitario">${valorUnitario.toFixed(2)}</span></td>
        <td><input type="number" class="form-control quantidadeProduto" min="1" value="${quantidade}" onchange="atualizarTodosOsCalculos('${ambienteSelecionado}')"></td>
        <td style="white-space: nowrap;">R$ <span class="valorTotal">${valorTotal.toFixed(2)}</span></td>
        <td><button class="btn btn-sm btn-danger" onclick="removerProduto(this, '${ambienteSelecionado}')">Remover</button></td>
    `;
    tabelaAmbiente.querySelector('tbody').appendChild(row);

    // Reaplicar o sortable para garantir que todos os produtos sejam arrastáveis
    $(`#tabela-${ambienteSelecionado} tbody`).sortable({
        placeholder: "ui-state-highlight",
        axis: "y",
        handle: "tr"
    }).disableSelection();

    // Fechar o modal após adicionar o produto
    const produtoGenericoModal = bootstrap.Modal.getInstance(document.getElementById('produtoGenericoModal'));
    produtoGenericoModal.hide();

    // Atualizar todos os cálculos
    atualizarTodosOsCalculos(ambienteSelecionado);
}


// Função para salvar a proposta
async function salvarProposta() {
    try {
        // Remover a parte "Excluir Ambiente" dos títulos
        document.querySelectorAll("#tabelasAmbientes .ambiente-container h4").forEach(header => {
            header.innerText = header.innerText.replace("Excluir Ambiente", "").trim();
        });

        // Selecionar os campos do formulário e garantir que campos vazios sejam preenchidos
        const nome = document.getElementById('nome').value.trim() || "Nome não informado";
        const cpfCnpj = document.getElementById('cpfCnpj').value.trim() || "";
        const endereco = document.getElementById('endereco').value.trim() || "";
        const numeroComplemento = document.getElementById('numeroComplemento').value.trim() || "";
        const telefone = document.getElementById('telefone').value.trim() || "Telefone não informado";
        const vendedor = document.getElementById('selectVendedor').value.trim() || "Vendedor não informado";
        const agenteArquiteto = document.getElementById('agenteArquiteto').value.trim() || "";
        const tipoEntrega = document.getElementById('tipoEntrega').value.trim() || "cliente"; // Cliente como padrão
        const valorFrete = parseFloat(document.getElementById('valorFrete').value.trim()) || 0;
        const tipoPagamento = document.getElementById('tipoPagamento').value.trim() || "pix"; // Pix como padrão
        const desconto = parseFloat(document.getElementById('desconto').value.trim()) || 0;
        const dataEntrega = document.getElementById('dataEntrega').value || null;

        // Validações básicas para garantir que os campos obrigatórios estão preenchidos
        if (!nome || !telefone || !vendedor) {
            alert("Por favor, preencha todos os campos obrigatórios: Nome, Telefone e Vendedor.");
            return;
        }

        // Pega todos os produtos e ambientes
        const produtos = [];
        document.querySelectorAll("#tabelasAmbientes .ambiente-container").forEach(container => {
            const ambiente = container.querySelector("h4").innerText.trim(); // Título sem "Excluir Ambiente"
            container.querySelectorAll("tbody tr").forEach((row) => {
                // Verificar se todos os elementos são encontrados
                const nomeProdutoElement = row.querySelector("td:nth-child(3)");
                const codigoProdutoElement = row.querySelector("td:nth-child(4)");
                const codigoInternoElement = row.querySelector("td:nth-child(5)");
                const valorUnitarioElement = row.querySelector(".valorUnitario");
                const quantidadeElement = row.querySelector(".quantidadeProduto");
                const valorTotalElement = row.querySelector(".valorTotal");

                if (
                    nomeProdutoElement &&
                    codigoProdutoElement &&
                    codigoInternoElement &&
                    valorUnitarioElement &&
                    quantidadeElement &&
                    valorTotalElement
                ) {
                    // Extrair e converter valores
                    const nomeProduto = nomeProdutoElement.innerText.trim();
                    const codigoProduto = codigoProdutoElement.innerText.trim();
                    const codigoInterno = codigoInternoElement.innerText.trim();
                    const valorUnitario = parseFloat(valorUnitarioElement.innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
                    const quantidade = parseFloat(quantidadeElement.value);
                    const valorTotal = parseFloat(valorTotalElement.innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));

                    // Pegar a observação, se houver
                    const obsRow = row.nextElementSibling;
                    let observacao = '';
                    if (obsRow && obsRow.classList.contains('observacao-row')) {
                        const obsTextArea = obsRow.querySelector('textarea');
                        if (obsTextArea) {
                            observacao = obsTextArea.value.trim();
                        }
                    }

                    // Validar se os valores são válidos antes de adicionar ao array
                    if (!isNaN(valorUnitario) && !isNaN(quantidade) && !isNaN(valorTotal)) {
                        // Adiciona ao array de produtos
                        produtos.push({
                            nomeProduto,
                            codigoProduto,
                            codigoInterno,
                            valorUnitario,
                            quantidade,
                            valorTotal,
                            ambiente,
                            statusSeparacao: 'Pendente', // Status padrão para produtos
                            observacao,
                        });
                    }
                }
            });
        });

        // Verificar se há produtos para serem enviados
        if (produtos.length === 0) {
            alert("Nenhum produto foi adicionado ao pedido.");
            return;
        }

        // Construir o objeto do pedido
        const pedido = {
            cliente: {
                nome,
                cpfCnpj,
                endereco,
                numeroComplemento,
                telefone,
            },
            informacoesOrcamento: {
                vendedor,
                agenteArquiteto,
                transportadora: tipoEntrega === 'acropoluz' ? 'Acropoluz' : 'Cliente',
                tipoEntrega,
                valorFrete,
                tipoPagamento,
                desconto,
                dataEntrega,
            },
            produtos,
            codigoClienteOmie: document.getElementById('idClienteOmie').value.trim() || "",
            status: 'Aberto',
        };

        console.log('Enviando pedido para salvar:', JSON.stringify(pedido, null, 2)); // Log detalhado para ver o pedido sendo enviado

        // Certifique-se de que a URL corresponde ao servidor backend que está rodando sua API
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/pedido/criar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedido),
        });

        // Analisar a resposta
        if (response.ok) {
            const jsonData = await response.json();
            alert('Proposta salva com sucesso!');
            console.log('Pedido salvo:', jsonData);
        } else {
            const errorData = await response.json();
            console.error('Erro ao salvar a proposta:', errorData);
            alert(`Erro ao salvar a proposta: ${errorData.message}`);
        }
    } catch (error) {
        // Tratar erros de rede ou outros
        console.error('Erro ao fazer a requisição:', error);
        alert('Erro ao se conectar ao servidor. Tente novamente mais tarde.');
    }
}




function mostrarElementos() {
    // Mostrar todos os botões com as classes 'btn btn-sm btn-danger' se estiverem ocultos
    document.querySelectorAll('button.btn.btn-sm.btn-danger').forEach(button => {
        if (button.style.display === 'none') {
            button.style.display = '';
        }
    });

    // Mostrar todos os botões com as classes 'btn btn-success' se estiverem ocultos
    document.querySelectorAll('button.btn.btn-success').forEach(button => {
        if (button.style.display === 'none') {
            button.style.display = '';
        }
    });

    // Mostrar a div com o ID 'divTabelaProdutos' se estiver oculta
    const divTabelaProdutos = document.getElementById('divTabelaProdutos');
    if (divTabelaProdutos && divTabelaProdutos.style.display === 'none') {
        divTabelaProdutos.style.display = '';
    }

    // Mostrar o elemento específico '#orcamentoContainer > div > div > div.row.align-items-center.no-print' se estiver oculto
    document.querySelectorAll('#orcamentoContainer > div > div > div.row.align-items-center.no-print').forEach(element => {
        if (element.style.display === 'none') {
            element.style.display = '';
        }
    });

    // Mostrar todas as colunas da tabela com classe 'table table-bordered' se estiverem ocultas
    document.querySelectorAll('table.table-bordered').forEach(table => {
        table.querySelectorAll('tr').forEach(row => {
            // Mostrar a coluna "Imagem" (primeira coluna)
            if (row.children.length > 0 && row.children[0].style.display === 'none') {
                row.children[0].style.display = ''; // Index 0 para a primeira coluna
            }
            // Mostrar a coluna "Nome" (segunda coluna) se houver edição
            if (row.children.length > 1 && row.children[1].style.display === 'none') {
                row.children[1].style.display = ''; // Index 1 para a segunda coluna
            }
            // Mostrar a coluna "Valor Unitário" (quinta coluna)
            if (row.children.length > 4 && row.children[4].style.display === 'none') {
                row.children[4].style.display = ''; // Index 4 para a coluna "Valor Unitário"
            }
            // Mostrar a coluna "QT" (sexta coluna)
            if (row.children.length > 5 && row.children[5].style.display === 'none') {
                row.children[5].style.display = ''; // Index 5 para a coluna "QT"
            }
            // Mostrar a coluna "Valor Total" (sétima coluna)
            if (row.children.length > 6 && row.children[6].style.display === 'none') {
                row.children[6].style.display = ''; // Index 6 para a coluna "Valor Total"
            }
            // Mostrar a coluna "Ação" (última coluna)
            if (row.children.length > 7 && row.children[7].style.display === 'none') {
                row.children[7].style.display = ''; // Index 7 para a coluna "Ação"
            }
        });
    });

    // Mostrar a coluna "Ação" no cabeçalho da tabela, se estiver oculta
    document.querySelectorAll('table.table-bordered').forEach(table => {
        const headerCells = table.querySelectorAll('th');
        if (headerCells.length > 7 && headerCells[7].style.display === 'none') {
            headerCells[7].style.display = ''; // Index 7 para a coluna "Ação"
        }
    });

    // Mostrar "Total do Ambiente" e "Total Geral" se estiverem ocultos
    document.querySelectorAll('.total-ambiente-bar').forEach(element => {
        if (element.style.display === 'none') {
            element.style.display = ''; // Mostrar elementos com a classe "total-ambiente-bar"
        }
    });

    const totalGeralBar = document.querySelector('.total-geral-bar.mt-4.p-3.bg-dark.text-white.text-center');
    if (totalGeralBar && totalGeralBar.style.display === 'none') {
        totalGeralBar.style.display = ''; // Mostrar elemento com a classe "total-geral-bar mt-4 p-3 bg-dark text-white text-center"
    }
}



function versaoDeEntrega() {


    document.querySelectorAll('button.btn.btn-sm.btn-danger').forEach(button => {
        button.style.display = 'none';
    });

    // Ocultar todos os botões com as classes 'btn btn-success'
    document.querySelectorAll('button.btn.btn-success').forEach(button => {
        button.style.display = 'none';
    });

      // Ocultar todos os botões com as classes 'btn btn-sm btn-danger'
      document.querySelectorAll('button.btn.btn-sm.btn-danger').forEach(button => {
        button.style.display = 'none';
    });

    // Ocultar todos os botões com as classes 'btn btn-success'
    document.querySelectorAll('button.btn.btn-success').forEach(button => {
        button.style.display = 'none';
    });

    // Ocultar a div com o ID 'divTabelaProdutos'
    const divTabelaProdutos = document.getElementById('divTabelaProdutos');
    if (divTabelaProdutos) {
        divTabelaProdutos.style.display = 'none';
    }

    // Ocultar o elemento específico '#orcamentoContainer > div > div > div.row.align-items-center.no-print'
    document.querySelectorAll('#orcamentoContainer > div > div > div.row.align-items-center.no-print').forEach(element => {
        element.style.display = 'none';
    });

    // Ocultar a coluna "Imagem" (primeira coluna)
    document.querySelectorAll('table.table-bordered').forEach(table => {
        table.querySelectorAll('tr').forEach(row => {
            if (row.children.length > 0) {
                row.children[0].style.display = 'none'; // Index 0 para ocultar a primeira coluna (Imagem)
            }
        });
    });

    // Editar os nomes dos produtos para mostrar apenas os primeiros 8 caracteres (segunda coluna)
    document.querySelectorAll('table.table-bordered').forEach(table => {
        table.querySelectorAll('tr').forEach(row => {
            if (row.children.length > 1) {
                const nomeProdutoCell = row.children[1]; // Index 1 para a coluna do nome
                const originalText = nomeProdutoCell.textContent.trim();
                nomeProdutoCell.textContent = originalText.substring(0, 8); // Mostrar apenas os primeiros 8 caracteres
            }
        });
    });

    // Ocultar a coluna "Valor Unitário" (quinta coluna) e "Valor Total" (sétima coluna)
    document.querySelectorAll('table.table-bordered').forEach(table => {
        table.querySelectorAll('tr').forEach(row => {
            if (row.children.length >= 6) {
                row.children[4].style.display = 'none'; // Index 4 para ocultar a coluna "Valor Unitário"
            }
            if (row.children.length >= 7) {
                row.children[6].style.display = 'none'; // Index 6 para ocultar a coluna "Valor Total"
            }
        });
    });

    // Ocultar a coluna "Ação" (última coluna)
    document.querySelectorAll('table.table-bordered').forEach(table => {
        // Ocultar o cabeçalho da coluna "Ação"
        const headerCells = table.querySelectorAll('th');
        if (headerCells.length > 7) {
            headerCells[7].style.display = 'none'; // Index 7 para ocultar a coluna "Ação"
        }

        // Ocultar cada célula da coluna "Ação" nas linhas da tabela
        table.querySelectorAll('tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 7) {
                cells[7].style.display = 'none'; // Index 7 para ocultar a célula correspondente à coluna "Ação"
            }
        });
    });

    // Ocultar "Total do Ambiente" e "Total Geral"
    document.querySelectorAll('.total-ambiente-bar').forEach(element => {
        element.style.display = 'none'; // Ocultar todos os elementos com a classe "total-ambiente-bar"
    });

    const totalGeralBar = document.querySelector('.total-geral-bar.mt-4.p-3.bg-dark.text-white.text-center');
    if (totalGeralBar) {
        totalGeralBar.style.display = 'none'; // Ocultar o elemento com a classe "total-geral-bar mt-4 p-3 bg-dark text-white text-center"
    }
    gerarFolhaOrcamento()
}




function ocultarElementos() {
    document.querySelectorAll('button.btn.btn-sm.btn-danger').forEach(button => {
        button.style.display = 'none';
    });

    // Ocultar todos os botões com as classes 'btn btn-success'
    document.querySelectorAll('button.btn.btn-success').forEach(button => {
        button.style.display = 'none';
    });
    // Ocultar todos os botões com as classes 'btn btn-sm btn-danger'
    document.querySelectorAll('button.btn.btn-sm.btn-danger').forEach(button => {
        button.style.display = 'none';
    });

    // Ocultar todos os botões com as classes 'btn btn-success'
    document.querySelectorAll('button.btn.btn-success').forEach(button => {
        button.style.display = 'none';
    });

    // Ocultar a div com o ID 'divTabelaProdutos'
    const divTabelaProdutos = document.getElementById('divTabelaProdutos');
    if (divTabelaProdutos) {
        divTabelaProdutos.style.display = 'none';
    }

    // Ocultar o elemento específico '#orcamentoContainer > div > div > div.row.align-items-center.no-print'
    document.querySelectorAll('#orcamentoContainer > div > div > div.row.align-items-center.no-print').forEach(element => {
        element.style.display = 'none';
    });

    // Ocultar a sexta coluna da tabela com classe 'table table-bordered'
    document.querySelectorAll('table.table-bordered').forEach(table => {
        table.querySelectorAll('tr').forEach(row => {
            if (row.children.length >= 6) {
                row.children[5].style.display = 'none'; // Index 5 se refere à sexta coluna (começa do 0)
            }
        });
    });

    // Ocultar a coluna "Ação" (última coluna) da tabela de ambientes
    document.querySelectorAll('table.table-bordered').forEach(table => {
        // Ocultar o cabeçalho da coluna "Ação"
        const headerCells = table.querySelectorAll('th');
        if (headerCells.length > 7) {
            headerCells[7].style.display = 'none'; // Index 7 para ocultar a coluna "Ação"
        }

        // Ocultar cada célula da coluna "Ação" nas linhas da tabela
        table.querySelectorAll('tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 7) {
                cells[7].style.display = 'none'; // Index 7 para ocultar a célula correspondente à coluna "Ação"
            }
        });
    });
    gerarFolhaOrcamento()
}

async function gerarFolhaOrcamento() {
    // Obtém o nome do cliente e a data atual
    const nomeCliente = document.getElementById('nome').value;
    const dataAtual = new Date().toLocaleDateString('pt-BR');


    // Atualiza o título da página de orçamento
    const tituloOrcamento = document.getElementById('tituloOrcamento');
  
    // Ocultar todos os botões com as classes 'btn btn-sm btn-danger'
// Função para ocultar os elementos




    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentPage = 0;

    // Captura o container do orçamento
    const container = document.getElementById('orcamentoContainer');

    // Usar o html2canvas para capturar o conteúdo em partes
    const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const imgWidth = 210; // Largura do PDF A4 em mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0; // posição vertical inicial no PDF

    // Adicionar a imagem em partes
    while (y < imgHeight) {
        if (currentPage > 0) {
            pdf.addPage(); // adiciona uma nova página depois da primeira
        }
        pdf.addImage(imgData, 'JPEG', 0, y ? -y : 0, imgWidth, imgHeight);
        y += pageHeight; // move para a próxima seção vertical
        currentPage++;
    }

    pdf.save('orcamento.pdf');
    mostrarElementos()
}

        async function renderPage(pdf, container, rows, pageWidth, pageHeight) {
            const clone = container.cloneNode(true);
            const tableBody = clone.querySelector('tbody');
            tableBody.innerHTML = ''; // Limpar e adicionar apenas as linhas necessárias

            rows.forEach(row => {
                tableBody.appendChild(row.cloneNode(true));
            });

            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, Math.min(pageHeight, canvas.height));
        }

        


        function incluirProdutosSelecionados() {
            const ambienteSelecionado = document.getElementById('ambienteSelecionado').value;
        
            if (ambienteSelecionado === '') {
                alert('Por favor, selecione um ambiente para adicionar produtos.');
                return;
            }
        
            let tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
            if (!tabelaAmbiente) {
                criarTabelaAmbiente(ambienteSelecionado);
                tabelaAmbiente = document.getElementById(`tabela-${ambienteSelecionado}`);
            }
        
            const checkboxes = document.querySelectorAll('.checkbox-selecionar-produto:checked');
            if (checkboxes.length === 0) {
                alert('Nenhum produto selecionado.');
                return;
            }
        
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                const nomeProduto = row.querySelector('.produto-nome').textContent;
                const codigoProduto = row.querySelector('td:nth-child(4)').textContent;
                const codigoInterno = row.querySelector('td:nth-child(5)').textContent;
                const valorUnitarioText = row.querySelector('td:nth-child(6)').textContent.replace('R$', '').trim();
                const valorUnitario = parseFloat(valorUnitarioText.replace('.', '').replace(',', '.'));
            
                // Verifique se o valor unitário é um número válido
                const valorUnitarioValido = !isNaN(valorUnitario) ? valorUnitario : 0;
            
                const imagemUrl = row.querySelector('img') ? row.querySelector('img').src : '';
            
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
                    <td>${nomeProduto}</td>
                    <td>${codigoProduto}</td>
                    <td>${codigoInterno}</td>
                    <td><span class="valorUnitario">${valorUnitarioValido}</span></td>
                    <td><input type="number" class="form-control quantidadeProduto" min="1" value="1" onchange="atualizarTodosOsCalculos('${ambienteSelecionado}')"></td>
                    <td><span class="valorTotal">${valorUnitarioValido}</span></td>
                    <td>
                        <i class="fa fa-question-circle" style="cursor: pointer; color: blue; margin-right: 10px;" onclick="adicionarObservacao(this)" title="Adicionar Observação"></i>
                        <i class="fa fa-times" style="cursor: pointer; color: red;" onclick="removerProduto(this, '${ambienteSelecionado}')" title="Remover Produto"></i>
                    </td>
                `;
                tabelaAmbiente.querySelector('tbody').appendChild(newRow);
            });
            
            // Reaplicar o sortable para garantir que todos os produtos sejam arrastáveis
            $(`#tabela-${ambienteSelecionado} tbody`).sortable({
                placeholder: "ui-state-highlight",
                axis: "y",
                handle: "tr"
            }).disableSelection();
        
            atualizarTodosOsCalculos(ambienteSelecionado);
        }
        

function adicionarObservacao(icon) {
    const row = icon.closest('tr');
    let obsRow = row.nextElementSibling;

    // Verificar se a linha de observação já existe
    if (obsRow && obsRow.classList.contains('observacao-row')) {
        // Se a linha de observação já estiver visível, alternar a exibição
        obsRow.style.display = obsRow.style.display === 'none' ? 'table-row' : 'none';
    } else {
        // Criar nova linha para observação
        obsRow = document.createElement('tr');
        obsRow.classList.add('observacao-row');
        obsRow.innerHTML = `
            <td colspan="8">
                <textarea class="form-control" placeholder="Digite uma observação para este produto"></textarea>
            </td>
        `;
        row.parentNode.insertBefore(obsRow, row.nextSibling);
    }
}

function mostrarTudo() {
    // Mostrar todos os botões com as classes 'btn btn-sm btn-danger'
    document.querySelectorAll('button.btn.btn-sm.btn-danger').forEach(button => {
        button.style.display = '';
    });

    // Mostrar a div com o ID 'divTabelaProdutos'
    const divTabelaProdutos = document.getElementById('divTabelaProdutos');
    if (divTabelaProdutos) {
        divTabelaProdutos.style.display = '';
    }

    // Mostrar o elemento específico '#orcamentoContainer > div > div > div.row.align-items-center.no-print'
    document.querySelectorAll('#orcamentoContainer > div > div > div.row.align-items-center.no-print').forEach(element => {
        element.style.display = '';
    });

    // Mostrar a sexta coluna da tabela com classe 'table table-bordered'
    document.querySelectorAll('table.table-bordered').forEach(table => {
        table.querySelectorAll('tr').forEach(row => {
            if (row.children.length >= 6) {
                row.children[5].style.display = ''; // Restaurar a exibição da sexta coluna
            }
        });
    });
}

function enviarDados() {
    // Coleta os dados do formulário
    const clienteEmail = document.getElementById("clienteEmail").value;
    const clienteRazaoSocial = document.getElementById("clienteRazaoSocial").value;
    const clienteNomeFantasia = document.getElementById("clienteNomeFantasia").value;
    const clienteTelefone = document.getElementById("clienteTelefone").value; // Ajustado o ID correto para telefone

    // Cria o objeto com os dados a serem enviados
    const data = {
        email: clienteEmail,
        razaoSocial: clienteRazaoSocial,
        nomeFantasia: clienteNomeFantasia,
        telefone: clienteTelefone
    };

    // Faz um POST para o Zapier webhook através de um proxy para evitar problemas de CORS
    fetch("https://cors-anywhere.herokuapp.com/https://hooks.zapier.com/hooks/catch/12161332/2mfdpo6/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log("Sucesso:", result);
        alert("Dados enviados com sucesso!");
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Ocorreu um erro ao enviar os dados.");
    });
}

