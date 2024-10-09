buscarClientes()
buscarPedidoPorId()
atualizarTotalGeral()
document.getElementById('btnRemoverSelecionados').addEventListener('click', function() {
    removerTodosProdutosSelecionados();
});
// Função para buscar e exibir os dados do pedido com base no ID fornecido na URL
async function buscarPedidoPorId() {
    // Obter o parâmetro 'id' da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('id');

    if (!idPedido) {
        console.error("ID do pedido não encontrado na URL.");
        return;
    }

    try {
        // Fazer a requisição para a API para obter os dados do pedido
        const response = await fetch(`https://acropoluz-one-cdc9c4e154cc.herokuapp.com/pedido/${idPedido}`);

        // Verificar se a resposta é bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro ao buscar o pedido. Status: ${response.status}`);
        }

        // Obter os dados do pedido em formato JSON
        const responseData = await response.json();

        // Exibir o pedido no console para verificar o conteúdo
        console.log("Pedido encontrado:", responseData);

        // Verificar se a resposta contém o objeto 'pedido'
        if (responseData.success && responseData.pedido) {
            preencherFormularioComDadosPedido(responseData.pedido);
        } else {
            console.error("Erro: Pedido não encontrado na resposta.");
        }

    } catch (error) {
        // Exibir erros no console
        console.error("Erro ao buscar o pedido:", error);
    }
}

function gerarCodigoClienteIntegracao() {
    const now = new Date();
    const horas = now.getHours().toString().padStart(2, '0');
    const minutos = now.getMinutes().toString().padStart(2, '0');
    const segundos = now.getSeconds().toString().padStart(2, '0');
    
    // Gera duas letras aleatórias
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letra1 = letras.charAt(Math.floor(Math.random() * letras.length));
    const letra2 = letras.charAt(Math.floor(Math.random() * letras.length));

    return `Codigo${letra1}${letra2}${horas}${minutos}${segundos}`;
}


 // Função para gerar um código de integração único com base no horário e letras aleatórias
 function gerarCodigoClienteIntegracao() {
    const now = new Date();
    const horas = now.getHours().toString().padStart(2, '0');
    const minutos = now.getMinutes().toString().padStart(2, '0');
    const segundos = now.getSeconds().toString().padStart(2, '0');
    
    // Gera duas letras aleatórias
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letra1 = letras.charAt(Math.floor(Math.random() * letras.length));
    const letra2 = letras.charAt(Math.floor(Math.random() * letras.length));

    return `Codigo${letra1}${letra2}${horas}${minutos}${segundos}`;
}

async function enviarDadosParaZapier() {
    try {
        // Dados do cliente
        const clienteData = {
            email: document.getElementById('clienteEmail').value,
            razao_social: document.getElementById('clienteRazaoSocial').value,
            nome_fantasia: document.getElementById('clienteNomeFantasia').value,
            telefone: document.getElementById('clienteTelefone').value
        };

        // Configuração das opções para a requisição
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': '3wsye-7du7s-tweaq-fb1n6-jifnf' // Inclui o token de autorização
            },
            body: JSON.stringify(clienteData) // Converte os dados do cliente para string JSON
        };

        // Faz a requisição para o webhook do Zapier
        const response = await fetch('https://hooks.zapier.com/hooks/catch/12161332/2mfdpo6/', options);

        if (!response.ok) {
            throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Resposta do Zapier:', data);
    } catch (err) {
        console.error('Erro ao enviar dados para Zapier:', err);
    }
}


// Chamada da função para enviar os dados



async function salvarCliente() {
    // Obter os dados do formulário
    const clienteData = {
        codigo_cliente_integracao: gerarCodigoClienteIntegracao(), // Gerar código de integração único
        email: document.getElementById('clienteEmail').value,
        razao_social: document.getElementById('clienteRazaoSocial').value,
        nome_fantasia: document.getElementById('clienteNomeFantasia').value,
        
    };

    try {
        // Fazer a requisição POST para incluir o cliente
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/clientes/incluirCliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteData)
        });

        // Verificar se a requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao incluir o cliente');
        }

        // Parsear a resposta
        const responseData = await response.json();

        // Verificar a resposta e pegar o `codigo_cliente_omie`
        if (responseData && responseData.codigo_cliente_omie) {
            alert(`Cliente salvo com sucesso! Código Omie: ${responseData.codigo_cliente_omie}`);
            enviarDadosParaZapier();
            
            // Fechar o modal
            const modalElement = document.getElementById('cadastrarClienteModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

            // Preencher o campo idClienteOmie com o código do cliente Omie
            document.getElementById('idClienteOmie').value = responseData.codigo_cliente_omie;
            document.getElementById('nome').value = document.getElementById('clienteNomeFantasia').value;
        } else {
            alert('Cliente salvo, mas não foi possível obter o código Omie.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Houve um problema ao salvar o cliente.');
    }
}


function preencherFormularioComDadosPedido(pedido) {
    console.log('Função chamada com pedido:', pedido);

    // Preencher os dados do cliente
    console.log('Preenchendo dados do cliente...');
    document.getElementById('nome').value = pedido.cliente.nome;
    document.getElementById('cpfCnpj').value = pedido.cliente.cpfCnpj;
    document.getElementById('endereco').value = pedido.cliente.endereco;
    document.getElementById('numeroComplemento').value = pedido.cliente.numeroComplemento || '';
    document.getElementById('telefone').value = pedido.cliente.telefone;

    // Preencher as informações do orçamento
    console.log('Preenchendo informações do orçamento...');
    document.getElementById('selectVendedor').value = pedido.informacoesOrcamento.vendedor || '';
    document.getElementById('agenteArquiteto').value = pedido.informacoesOrcamento.agenteArquiteto || '';
    document.getElementById('dataEntrega').value = pedido.informacoesOrcamento.dataEntrega ? pedido.informacoesOrcamento.dataEntrega.slice(0, 10) : '';
    document.getElementById('tipoEntrega').value = pedido.informacoesOrcamento.transportadora === 'Acropoluz' ? 'acropoluz' : 'cliente';
    document.getElementById('valorFrete').value = pedido.informacoesOrcamento.valorFrete || 0;
    document.getElementById('tipoPagamento').value = pedido.informacoesOrcamento.tipoPagamento || '';
    document.getElementById('desconto').value = pedido.informacoesOrcamento.desconto || 0;

    // Preencher o código do cliente Omie
    document.getElementById('idClienteOmie').value = pedido.codigoClienteOmie;

    // Preencher os produtos nos ambientes
    console.log('Preenchendo produtos nos ambientes...');
    const tabelasAmbientesDiv = document.getElementById('tabelasAmbientes');
    tabelasAmbientesDiv.innerHTML = ''; // Limpar qualquer conteúdo anterior

    const ambientesMap = {};

    // Agrupar produtos por ambiente
    pedido.produtos.forEach(produto => {
        if (!ambientesMap[produto.ambiente]) {
            ambientesMap[produto.ambiente] = [];
        }
        ambientesMap[produto.ambiente].push(produto);
    });

    // Criar tabelas para cada ambiente no modelo especificado
    Object.keys(ambientesMap).forEach(ambiente => {
        console.log('Criando tabela para ambiente:', ambiente);

        const ambienteDiv = document.createElement('div');
        ambienteDiv.classList.add('mt-4', 'ambiente-container');
        ambienteDiv.setAttribute('id', `div-${ambiente}`);

        let totalAmbiente = 0;

        ambienteDiv.innerHTML = `
            <h4 class="text-center text-uppercase" style="font-weight: bold;">
                ${ambiente}
                <button class="btn btn-sm btn-danger" onclick="removerAmbiente('${ambiente}')">Excluir Ambiente</button>
            </h4>
            <table class="table table-bordered" id="tabela-${ambiente}">
                <thead>
                    <tr>
                        <th><input type="checkbox" onclick="selecionarTodosProdutos(this, 'tabela-${ambiente}')"></th>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Código</th>
                        <th>Código Interno</th>
                        <th>Valor Unitário</th>
                        <th>QT</th>
                        <th>Valor Total</th>
                         <th>Obs</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    ${ambientesMap[ambiente].map(produto => {
            const valorTotal = produto.valorUnitario * produto.quantidade;
            totalAmbiente += valorTotal;

            return `
                            <tr>
                             <td><input type="checkbox" class="checkbox-selecionar-produto"></td>
                                <td>${produto.imagemUrl ? `<img src="${produto.imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
                                <td>${produto.nomeProduto}</td>
                                <td>${produto.codigoProduto}</td>
                                <td>${produto.codigoInterno}</td>
                                <td style="white-space: nowrap;"> <span class="valorUnitario">&nbsp;${produto.valorUnitario}</span></td>
                                <td><input type="number" class="form-control quantidadeProduto" min="1" value="${produto.quantidade}" onchange="atualizarTodosOsCalculos('${ambiente}')"></td>
                                <td style="white-space: nowrap;"><span class="valorTotal">&nbsp;${valorTotal.toFixed(2)}</span></td>
                                <td><textarea class="form-control" rows="3" cols="30">${produto.observacao || ''}</textarea></td>
                                <td>
                                    <i class="fa fa-question-circle" style="cursor: pointer; color: blue; margin-right: 10px;" onclick="adicionarObservacao(this)" title="Adicionar Observação"></i>
                                    <i class="fa fa-times" style="cursor: pointer; color: red;" onclick="removerProduto(this, '${ambiente}')" title="Remover Produto"></i>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
            <div class="total-ambiente-bar" id="total-${ambiente}">Total do Ambiente: &nbsp;${totalAmbiente.toFixed(2)}</div>
        `;
        tabelasAmbientesDiv.appendChild(ambienteDiv);
        atualizarTodosOsCalculos(ambiente);
        atualizarTotalGeral();
    });

    // Atualizar os totais dos ambientes e o total geral
    atualizarTotalGeral();
}










// Função para calcular e atualizar o total geral
function atualizarTotalGeral() {
    let totalGeral = 0;

    // Iterar sobre cada tabela de ambiente e somar os totais dos produtos
    document.querySelectorAll("#tabelasAmbientes .ambiente-container").forEach(container => {
        let totalAmbiente = 0;

        container.querySelectorAll("tbody tr").forEach(row => {
            const valorTotal = parseFloat(row.querySelector(".valorTotal").innerText);
            totalAmbiente += valorTotal;
        });

        // Atualizar o total do ambiente na interface
        container.querySelector('.total-ambiente-bar').innerText = `Total do Ambiente: R$ ${totalAmbiente.toFixed(2)}`;

        totalGeral += totalAmbiente;
    });

    // Atualizar o total geral na interface
    document.getElementById('total-geral').innerText = `Total Geral: R$ ${totalGeral.toFixed(2)}`;
}

// Função para atualizar o subtotal ao alterar a quantidade de um produto
function atualizarSubtotal(input, ambiente) {
    const row = input.closest('tr');
    const valorUnitario = parseFloat(row.querySelector(".valorUnitario").innerText);
    const quantidade = parseFloat(input.value);
    const valorTotal = valorUnitario * quantidade;

    row.querySelector(".valorTotal").innerText = valorTotal.toFixed(2);

    // Atualizar os totais do ambiente e o total geral
    atualizarTotalGeral();
}


// Função para atualizar o subtotal ao alterar a quantidade de um produto
function atualizarSubtotal(input, ambiente) {
    const row = input.closest('tr');
    const valorUnitario = parseFloat(row.querySelector(".valorUnitario").innerText);
    const quantidade = parseFloat(input.value);
    const valorTotal = valorUnitario * quantidade;

    row.querySelector(".valorTotal").innerText = valorTotal.toFixed(2);

    // Atualizar os totais do ambiente e o total geral
    atualizarTotalGeral();
}

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

    // Iniciar a pesquisa apenas se houver pelo menos 3 caracteres
    if (pesquisa.length < 2) {
        divTabelaProdutos.style.display = 'none';
        return;
    } else {
        divTabelaProdutos.style.display = 'block';
    }

    try {
        // Alterar a URL da rota para a correta
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/produtos/visualizar');
        if (!response.ok) {
            throw new Error('Erro ao buscar os produtos');
        }

        const produtos = await response.json();
        const produtosFiltrados = produtos.filter(produto => {
            const descricao = produto.descricao ? produto.descricao.toLowerCase() : '';
            const codigo = produto.codigo ? produto.codigo.toLowerCase() : '';
            const codigoProduto = produto.codigo_produto ? produto.codigo_produto.toString().toLowerCase() : '';

            return descricao.includes(pesquisa) || codigo.includes(pesquisa) || codigoProduto.includes(pesquisa);
        });

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
    // Verifica se o ambiente está vazio ou não foi selecionado corretamente
    if (!ambiente) {
        console.error('Erro: Ambiente não fornecido ou inválido.');
        return;
    }

    // Verifica se a tabela já existe antes de criar uma nova
    let tabelaAmbienteExistente = document.getElementById(`div-${ambiente}`);
    if (tabelaAmbienteExistente) {
        console.warn(`A tabela para o ambiente "${ambiente}" já existe. Não será criada uma nova.`);
        return; // Se já existe, não cria novamente
    }

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
                    <th><input type="checkbox" onclick="selecionarTodosProdutos(this, 'tabela-${ambiente}')"></th>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Código</th>
                    <th>Código Interno</th>
                    <th>Valor Unitário</th>
                    <th>Quantidade</th>
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
}

function atualizarTodosOsCalculos(ambiente) {
    // Verifica se o ambiente está definido e se a tabela existe
    if (!ambiente) {
        console.error('Erro: Ambiente não fornecido.');
        return;
    }

    const tabelaAmbiente = document.getElementById(`tabela-${ambiente}`);
    if (!tabelaAmbiente) {
        console.error(`Erro: Tabela do ambiente "${ambiente}" não encontrada.`);
        return;
    }

    let totalAmbiente = 0;

    // Selecionar todas as linhas da tabela para recalcular o total
    const linhas = tabelaAmbiente.querySelectorAll('tbody tr');

    linhas.forEach(row => {
        const valorUnitarioElement = row.querySelector('.valorUnitario');
        const quantidadeElement = row.querySelector('.quantidadeProduto');
        const valorTotalElement = row.querySelector('.valorTotal');

        if (valorUnitarioElement && quantidadeElement && valorTotalElement) {
            let valorUnitario = parseFloat(valorUnitarioElement.textContent.replace(/[^\d,.-]/g, '').replace(',', '.'));
            let quantidade = parseFloat(quantidadeElement.value);

            if (!isNaN(valorUnitario) && !isNaN(quantidade)) {
                const novoValorTotal = valorUnitario * quantidade;
                valorTotalElement.textContent = `R$ ${novoValorTotal.toFixed(2).replace('.', ',')}`;
                totalAmbiente += novoValorTotal;
            } else {
                valorTotalElement.textContent = 'R$ 0,00';
            }
        }
    });

    // Atualizar o total do ambiente na interface
    const totalAmbienteElement = document.getElementById(`total-${ambiente}`);
    if (totalAmbienteElement) {
        totalAmbienteElement.textContent = `Total do Ambiente: R$ ${totalAmbiente.toFixed(2).replace('.', ',')}`;
    } else {
        console.error(`Erro: Elemento total do ambiente "${ambiente}" não encontrado.`);
    }

    // Atualizar o total geral de todos os ambientes
    atualizarTotalGeral();
}


function atualizarTotalGeral() {
    let totalGeral = 0;

    // Iterar por cada elemento que contém o total de um ambiente
    document.querySelectorAll('.total-ambiente-bar').forEach(element => {
        let totalAmbienteText = element.textContent.replace('Total do Ambiente: R$', '').replace(/\./g, '').replace(',', '.').trim();
        const totalAmbiente = parseFloat(totalAmbienteText);

        if (!isNaN(totalAmbiente)) {
            totalGeral += totalAmbiente;
        }
    });

    // Atualizar o valor total geral, formatando-o como moeda brasileira
    document.getElementById('total-geral').textContent = `Total Geral: R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
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
    <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
    <td>${nomeProduto}</td>
    <td>101020</td>
    <td>101020</td>
   <td style="white-space: nowrap;"><span class="valorUnitario">${valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
    <td><input type="number" class="form-control quantidadeProduto" min="1" value="${quantidade}" onchange="atualizarTodosOsCalculos('${ambienteSelecionado}')"></td>
    <td style="white-space: nowrap;"><span class="valorTotal">${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
    <th>Obs</th>
    <td>
        <i class="fa fa-question-circle" style="cursor: pointer; color: blue;" onclick="adicionarObservacao(this)" title="Adicionar Observação"></i>
        <i class="fa fa-trash" style="cursor: pointer; color: red; margin-left: 10px;" onclick="removerProduto(this, '${ambienteSelecionado}')" title="Remover Produto"></i>
    </td>
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

// Função para atualizar o total geral
function validarDesconto() {
    const desconto = parseFloat(document.getElementById('desconto').value);

    // Verifica se o desconto é maior que 4%
    if (desconto >= 4) {
        const senha = prompt("Desconto superior a 4%. Insira a senha de segurança do gestor:");

        // Verifica se a senha está correta
        if (senha !== "validado%pelo%gestor&%da%pasta") {
            alert("Senha incorreta. Não é possível aplicar um desconto superior a 4% sem autorização.");
            // Redefine o desconto para 0 e não permite continuar
            document.getElementById('desconto').value = 0;
        }
    }

    // Atualizar o total geral após a verificação do desconto
    atualizarTotalGeral();
}

function atualizarTotalGeral() {
    let totalGeral = 0;

    // Iterar sobre cada tabela de ambiente e somar os totais dos produtos
    document.querySelectorAll("#tabelasAmbientes .ambiente-container").forEach(container => {
        let totalAmbiente = 0;

        container.querySelectorAll("tbody tr").forEach(row => {
            const valorTotal = parseFloat(row.querySelector(".valorTotal").innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
            totalAmbiente += valorTotal;
        });

        // Atualizar o total do ambiente na interface
        container.querySelector('.total-ambiente-bar').innerText = `Total do Ambiente: R$ ${totalAmbiente.toFixed(2).replace('.', ',')}`;

        totalGeral += totalAmbiente;
    });

    // Calcular o total geral e aplicar desconto, se houver
    const desconto = parseFloat(document.getElementById('desconto').value);
    const totalComDesconto = desconto > 0 ? totalGeral * (1 - desconto / 100) : totalGeral;

    // Atualizar o total geral na interface
    document.getElementById('total-geral').innerText = `Total Geral: R$ ${totalGeral.toFixed(2).replace('.', ',')}`;

    // Mostrar ou ocultar o valor com desconto, conforme o valor do desconto
    const descontoElement = document.getElementById('total-com-desconto');
    if (desconto > 0) {
        descontoElement.style.display = "block";
        descontoElement.innerText = `Total com Desconto Aplicado: R$ ${totalComDesconto.toFixed(2).replace('.', ',')}`;
    } else {
        descontoElement.style.display = "none";
    }
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
        <td><input type="checkbox" class="checkbox-selecionar-produto"></td>
        <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
        <td>${nomeProduto}</td>
        <td>${codigoProduto || 'N/A'}</td>
        <td>${codigoInterno || 'N/A'}</td>
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


// Função para remover um ambiente inteiro (tabela e produtos)
function removerAmbiente(ambiente) {
    const divAmbiente = document.getElementById(`div-${ambiente}`);
    if (divAmbiente) {
        divAmbiente.remove();
        atualizarTotalGeral()
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
          <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
    <td>${nomeProduto}</td>
    <td>101020</td>
    <td>101020</td>
    <td style="white-space: nowrap;"><span class="valorUnitario">${valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
    <td><input type="number" class="form-control quantidadeProduto" min="1" value="${quantidade}" onchange="atualizarTodosOsCalculos('${ambienteSelecionado}')"></td>
    <td style="white-space: nowrap;"><span class="valorTotal">${valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
    <th>Obs</th>
    <td>
        <i class="fa fa-question-circle" style="cursor: pointer; color: blue;" onclick="adicionarObservacao(this)" title="Adicionar Observação"></i>
        <i class="fa fa-trash" style="cursor: pointer; color: red; margin-left: 10px;" onclick="removerProduto(this, '${ambienteSelecionado}')" title="Remover Produto"></i>
    </td> `;
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

        // Selecionar os campos do formulário
        const nome = document.getElementById('nome').value.trim();
        const cpfCnpj = document.getElementById('cpfCnpj').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const numeroComplemento = document.getElementById('numeroComplemento').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const vendedor = document.getElementById('selectVendedor').value.trim();
        const agenteArquiteto = document.getElementById('agenteArquiteto').value.trim();
        const tipoEntrega = document.getElementById('tipoEntrega').value.trim();
        const valorFrete = parseFloat(document.getElementById('valorFrete').value.trim()) || 0;
        const tipoPagamento = document.getElementById('tipoPagamento').value.trim();
        const desconto = parseFloat(document.getElementById('desconto').value.trim()) || 0;
        const dataEntrega = document.getElementById('dataEntrega').value;

        // Validações básicas para garantir que os campos obrigatórios estão preenchidos
        if (!nome || !cpfCnpj || !endereco || !telefone || !vendedor || !dataEntrega) {
            alert("Por favor, preencha todos os campos obrigatórios.");
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
            codigoClienteOmie: document.getElementById('idClienteOmie').value.trim(),
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
            <td><input type="checkbox" class="checkbox-selecionar-produto"></td>
            <td>${imagemUrl ? `<img src="${imagemUrl}" alt="Imagem do Produto Selecionado" style="max-width: 50px;">` : '<span>Sem imagem</span>'}</td>
            <td>${nomeProduto}</td>
            <td>${codigoProduto}</td>
            <td>${codigoInterno}</td>
            <td style="white-space: nowrap;"><span class="valorUnitario">${valorUnitarioValido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
            <td><input type="number" class="form-control quantidadeProduto" min="1" value="1" onchange="atualizarTodosOsCalculos('${ambienteSelecionado}')"></td>
            <td style="white-space: nowrap;"><span class="valorTotal">${valorUnitarioValido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></td>
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
            <td colspan="9">
                <textarea class="form-control" placeholder="Digite uma observação para este produto"></textarea>
            </td>
        `;
        row.parentNode.insertBefore(obsRow, row.nextSibling);
    }
}


function selecionarTodosProdutos(checkbox, ambienteTabelaId) {
    const tabela = document.getElementById(ambienteTabelaId);
    if (tabela) {
        const checkboxes = tabela.querySelectorAll('.checkbox-selecionar-produto');
        checkboxes.forEach(cb => cb.checked = checkbox.checked);
    }
}

function removerProdutosSelecionados(ambiente) {
    const tabelaAmbiente = document.getElementById(`tabela-${ambiente}`);
    if (!tabelaAmbiente) {
        console.error(`Erro: Tabela do ambiente "${ambiente}" não encontrada.`);
        return;
    }

    const checkboxesSelecionados = tabelaAmbiente.querySelectorAll('.checkbox-selecionar-produto:checked');

    if (checkboxesSelecionados.length === 0) {
        alert('Nenhum produto selecionado para exclusão.');
        return;
    }

    const confirmarRemocao = confirm(`Você tem certeza que deseja remover ${checkboxesSelecionados.length} produto(s)?`);
    if (!confirmarRemocao) return;

    checkboxesSelecionados.forEach(checkbox => {
        const row = checkbox.closest('tr');
        let obsRow = row.nextElementSibling;

        // Remover a linha de observação associada, se existir
        if (obsRow && obsRow.classList.contains('observacao-row')) {
            obsRow.remove();
        }

        row.remove();
    });

    // Atualizar os cálculos do ambiente e o total geral
    atualizarTodosOsCalculos(ambiente);
    atualizarTotalGeral();
}

// Função para ler a tabela e remover todos os produtos marcados, utilizando a função removerProduto
function removerProdutosSelecionadosDaTabela(ambiente) {
    const tabelaAmbiente = document.getElementById(`tabela-${ambiente}`);
    if (!tabelaAmbiente) {
        console.error(`Erro: Tabela do ambiente "${ambiente}" não encontrada.`);
        return;
    }

    // Selecionar todos os produtos marcados (checkboxes selecionados)
    const checkboxesSelecionados = tabelaAmbiente.querySelectorAll('.checkbox-selecionar-produto:checked');

    if (checkboxesSelecionados.length === 0) {
        alert('Nenhum produto selecionado para exclusão.');
        return;
    }

    // Iterar sobre cada checkbox marcado e remover o produto usando a função removerProduto
    checkboxesSelecionados.forEach(checkbox => {
        const row = checkbox.closest('tr');
        let icon = row.querySelector('.fa-times'); // Selecionar o ícone de remoção correspondente
        if (icon) {
            removerProduto(icon, ambiente);
        }
    });

    // Atualizar os cálculos do ambiente e o total geral
    atualizarTodosOsCalculos(ambiente);
    atualizarTotalGeral();
}

// Função para remover todos os produtos selecionados de todas as tabelas
function removerTodosProdutosSelecionados() {
    const tabelasAmbientes = document.querySelectorAll('.ambiente-container');

    // Iterar sobre cada tabela de ambiente e remover os produtos selecionados
    tabelasAmbientes.forEach(tabelaAmbiente => {
        const ambiente = tabelaAmbiente.getAttribute('id').replace('div-', '');
        removerProdutosSelecionadosDaTabela(ambiente);
    });
}
document.getElementById('btnRemoverSelecionados').addEventListener('click', function() {
    removerTodosProdutosSelecionados();
});

async function atualizarProposta() {
    // Obter o ID do pedido da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('id');

    if (!idPedido) {
        console.error("ID do pedido não encontrado na URL.");
        return;
    }

    try {
        // Remover a parte "Excluir Ambiente" dos títulos
        document.querySelectorAll("#tabelasAmbientes .ambiente-container h4").forEach(header => {
            header.innerText = header.innerText.replace("Excluir Ambiente", "").trim();
        });

        // Selecionar os campos do formulário
        const nome = document.getElementById('nome').value.trim();
        const cpfCnpj = document.getElementById('cpfCnpj').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const numeroComplemento = document.getElementById('numeroComplemento').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const vendedor = document.getElementById('selectVendedor').value.trim();
        const agenteArquiteto = document.getElementById('agenteArquiteto').value.trim();
        const tipoEntrega = document.getElementById('tipoEntrega').value.trim();
        const valorFrete = parseFloat(document.getElementById('valorFrete').value.trim()) || 0;
        const tipoPagamento = document.getElementById('tipoPagamento').value.trim();
        const desconto = parseFloat(document.getElementById('desconto').value.trim()) || 0;
        const dataEntrega = document.getElementById('dataEntrega').value;

        // Validações básicas para garantir que os campos obrigatórios estão preenchidos
        if (!nome || !cpfCnpj || !endereco || !telefone || !vendedor || !dataEntrega) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Pega todos os produtos e ambientes
        const produtos = [];
        document.querySelectorAll("#tabelasAmbientes .ambiente-container").forEach(container => {
            const ambiente = container.querySelector("h4").innerText.trim(); // Título sem "Excluir Ambiente"
            container.querySelectorAll("tbody tr").forEach((row) => {
                // Extrair os dados do produto da linha da tabela
                const nomeProduto = row.querySelector("td:nth-child(3)")?.innerText.trim() || '';
                const codigoProduto = row.querySelector("td:nth-child(4)")?.innerText.trim() || '';
                const codigoInterno = row.querySelector("td:nth-child(5)")?.innerText.trim() || '';
                const valorUnitario = parseFloat(row.querySelector(".valorUnitario")?.innerText.replace(/[^\d,.-]/g, '').replace(',', '.') || 0);
                const quantidade = parseFloat(row.querySelector(".quantidadeProduto")?.value || 0);
                const valorTotal = parseFloat(row.querySelector(".valorTotal")?.innerText.replace(/[^\d,.-]/g, '').replace(',', '.') || 0);

                // Inicializa observação como vazia
                let observacao = '';

                // Verificar se há um campo de observação na coluna (9ª coluna)
                if (row.querySelector("td:nth-child(9) textarea")) {
                    observacao = row.querySelector("td:nth-child(9) textarea").value.trim();
                } else {
                    // Se não houver na coluna, verificar se a próxima linha é uma linha de observação
                    const nextRow = row.nextElementSibling;
                    if (nextRow && nextRow.classList.contains('observacao-row')) {
                        observacao = nextRow.querySelector('textarea')?.value.trim() || '';
                    }
                }

                // Validar se os valores são válidos antes de adicionar ao array
                if (nomeProduto && !isNaN(valorUnitario) && !isNaN(quantidade) && !isNaN(valorTotal)) {
                    // Adiciona ao array de produtos
                    produtos.push({
                        nomeProduto,
                        codigoProduto,
                        codigoInterno,
                        valorUnitario,
                        quantidade,
                        valorTotal,
                        observacao,
                        ambiente,
                        statusSeparacao: 'Pendente' // Status padrão para produtos
                    });
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
                valorFrete,
                tipoPagamento,
                desconto,
                dataEntrega,
            },
            produtos,
            codigoClienteOmie: document.getElementById('idClienteOmie').value.trim(),
        };

        console.log('Enviando pedido para atualizar:', JSON.stringify(pedido, null, 2)); // Log detalhado para ver o pedido sendo enviado

        // Fazer a requisição de atualização do pedido
        const response = await fetch(`https://acropoluz-one-cdc9c4e154cc.herokuapp.com/pedido/${idPedido}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });

        // Analisar a resposta
        if (response.ok) {
            const jsonData = await response.json();
            alert('Proposta atualizada com sucesso!');
            window.location.reload();
            console.log('Pedido atualizado:', jsonData);
        } else {
            const errorData = await response.json();
            console.error('Erro ao atualizar a proposta:', errorData);
            alert(`Erro ao atualizar a proposta: ${errorData.message}`);
        }
    } catch (error) {
        // Tratar erros de rede ou outros
        console.error('Erro ao fazer a requisição:', error);
        alert('Erro ao se conectar ao servidor. Tente novamente mais tarde.');
    }
}


async function gerarEEnviarProposta() {
    // Verificar se existe algum valor igual a 0 na tabela
    const temValorZero = [...document.querySelectorAll('#tabelasAmbientes .valorUnitario, #tabelasAmbientes .valorTotal')].some(cell => {
        const valor = parseFloat(cell.innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
        return valor === 0 || isNaN(valor);
    });

    if (temValorZero) {
        alert('Um produto com valor 0,00 está presente. Por favor, corrija antes de gerar a folha de proposta.');
        return;
    }

    // Obter valores do formulário
    alert('Processamento do pedido no financeiro foi enviado!');
    const codigoCliente = document.getElementById('idClienteOmie').value.trim();
    const dataPrevisao = new Date().toLocaleDateString('pt-BR'); // Data atual no formato dd/mm/yyyy
    const numeroPedido = '93168'; // Você pode obter isso dinamicamente, se necessário

    // Gerar um código aleatório usando a hora e segundos atuais e letras
    function gerarCodigoAleatorio() {
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const numeros = Date.now().toString();
        let resultado = '';
        for (let i = 0; i < 3; i++) {
            resultado += letras.charAt(Math.floor(Math.random() * letras.length));
        }
        return numeros + resultado;
    }

    // Obter todos os produtos da tabela
    const produtos = [];
    document.querySelectorAll("#tabelasAmbientes .ambiente-container tbody tr").forEach((row) => {
        const nomeProduto = row.querySelector("td:nth-child(3)").innerText.trim();
        const codigoProduto = row.querySelector("td:nth-child(4)").innerText.trim();
        const codigoInterno = row.querySelector("td:nth-child(4)").innerText.trim();
        const valorUnitario = parseFloat(row.querySelector("td:nth-child(6) .valorUnitario").innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
        const quantidade = parseInt(row.querySelector("td:nth-child(7) .quantidadeProduto").value);
        const valorTotal = parseFloat(row.querySelector("td:nth-child(8) .valorTotal").innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
        const observacao = row.querySelector("td:nth-child(9) textarea") ? row.querySelector("td:nth-child(9) textarea").value.trim() : '';

        if (!isNaN(valorUnitario) && !isNaN(quantidade) && !isNaN(valorTotal)) {
            produtos.push({
                ide: {
                    codigo_item_integracao: gerarCodigoAleatorio()
                },
                inf_adic: {
                    peso_bruto: 1,
                    peso_liquido: 1
                },
                produto: {
                    cfop: "5.102",
                    codigo_produto: codigoInterno,
                    descricao: nomeProduto,
                    ncm: "9403.30.00",
                    quantidade: quantidade,
                    tipo_desconto: "V",
                    unidade: "UN",
                    valor_desconto: 0,
                    valor_unitario: valorUnitario
                },
              
            });
        }
    });

    // Construir o objeto da proposta
    const proposta = {
        cabecalho: {
            codigo_cliente: codigoCliente,
            codigo_pedido_integracao: gerarCodigoAleatorio(),
            data_previsao: dataPrevisao,
            etapa: "10",
            numero_pedido: numeroPedido,
            codigo_parcela: "999",
            quantidade_itens: produtos.length
        },
        det: produtos,
        frete: {
            modalidade: "9"
        },
        informacoes_adicionais: {
            codigo_categoria: "1.05.98",
            codigo_conta_corrente: "3528553913" , 
            consumidor_final: "S",
            enviar_email: "N"
        },
        lista_parcelas: {
            parcela: [
                {
                    data_vencimento: "04/10/2024",
                    numero_parcela: 1,
                    percentual: 100,
                    valor: 100
                }
            ]
        }
    };

    // Enviar a estrutura gerada para a API
    try {
        console.log(proposta);
        const response = await fetch('https://acropoluz-one-cdc9c4e154cc.herokuapp.com/omie/incluir-pedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proposta)
        });

        if (!response.ok) {
            throw new Error(`Erro ao enviar a proposta. Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Proposta enviada com sucesso:', responseData);
        alert('Seu pedido foi enviado para o financeiro com sucesso!');
        atualizarPropostaEfetivado ()
        // Chamar a função para atualizar a proposta
       
    } catch (error) {
        console.error('Erro ao enviar a proposta:', error);
        alert('Aconteceu algo de errado!');
    }
}
async function atualizarPropostaEfetivado () {
    // Obter o ID do pedido da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('id');

    if (!idPedido) {
        console.error("ID do pedido não encontrado na URL.");
        return;
    }

    try {
        // Remover a parte "Excluir Ambiente" dos títulos
        document.querySelectorAll("#tabelasAmbientes .ambiente-container h4").forEach(header => {
            header.innerText = header.innerText.replace("Excluir Ambiente", "").trim();
        });

        // Obter todos os produtos e ambientes
        const produtos = [];
        document.querySelectorAll("#tabelasAmbientes .ambiente-container").forEach(container => {
            const ambiente = container.querySelector("h4").innerText.trim();
            container.querySelectorAll("tbody tr").forEach((row) => {
                const nomeProduto = row.querySelector("td:nth-child(3)")?.innerText.trim() || '';
                const codigoProduto = row.querySelector("td:nth-child(4)")?.innerText.trim() || '';
                const codigoInterno = row.querySelector("td:nth-child(5)")?.innerText.trim() || '';
                const valorUnitario = parseFloat(row.querySelector(".valorUnitario")?.innerText.replace(/[^\d,.-]/g, '').replace(',', '.') || 0);
                const quantidade = parseFloat(row.querySelector(".quantidadeProduto")?.value || 0);
                const valorTotal = parseFloat(row.querySelector(".valorTotal")?.innerText.replace(/[^\d,.-]/g, '').replace(',', '.') || 0);
                let observacao = '';

                // Verificar observação
                if (row.querySelector("td:nth-child(9) textarea")) {
                    observacao = row.querySelector("td:nth-child(9) textarea").value.trim();
                } else {
                    const nextRow = row.nextElementSibling;
                    if (nextRow && nextRow.classList.contains('observacao-row')) {
                        observacao = nextRow.querySelector('textarea')?.value.trim() || '';
                    }
                }

                if (nomeProduto && !isNaN(valorUnitario) && !isNaN(quantidade) && !isNaN(valorTotal)) {
                    produtos.push({
                        nomeProduto,
                        codigoProduto,
                        codigoInterno,
                        valorUnitario,
                        quantidade,
                        valorTotal,
                        observacao,
                        ambiente,
                        statusSeparacao: 'Efetivado' // Atualiza o status para 'Efetivado'
                    });
                }
            });
        });

        // Construir o objeto do pedido
        const pedido = {
            produtos,
            codigoClienteOmie: document.getElementById('idClienteOmie').value.trim(),
        };

        // Fazer a requisição de atualização do pedido
        const response = await fetch(`https://acropoluz-one-cdc9c4e154cc.herokuapp.com/pedido/${idPedido}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });

        // Analisar a resposta
        if (response.ok) {
            alert('Proposta atualizada com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            console.error('Erro ao atualizar a proposta:', errorData);
            alert(`Erro ao atualizar a proposta: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        alert('Erro ao se conectar ao servidor. Tente novamente mais tarde.');
    }
}
async function atualizarProposta() {
    // Obter o ID do pedido da URL
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('id');

    if (!idPedido) {
        console.error("ID do pedido não encontrado na URL.");
        return;
    }

    try {
        // Remover a parte "Excluir Ambiente" dos títulos
        document.querySelectorAll("#tabelasAmbientes .ambiente-container h4").forEach(header => {
            header.innerText = header.innerText.replace("Excluir Ambiente", "").trim();
        });

        // Coletar dados do cliente
        const nome = document.getElementById('nome').value.trim();
        const cpfCnpj = document.getElementById('cpfCnpj').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const numeroComplemento = document.getElementById('numeroComplemento').value.trim();
        const telefone = document.getElementById('telefone').value.trim();

        // Coletar informações do orçamento
        const vendedor = document.getElementById('selectVendedor').value.trim();
        const agenteArquiteto = document.getElementById('agenteArquiteto').value.trim();
        const tipoEntrega = document.getElementById('tipoEntrega').value.trim();
        const valorFrete = parseFloat(document.getElementById('valorFrete').value.trim()) || 0;
        const tipoPagamento = document.getElementById('tipoPagamento').value.trim();
        const desconto = parseFloat(document.getElementById('desconto').value.trim()) || 0;
        const dataEntrega = document.getElementById('dataEntrega').value;

        // Obter todos os produtos e ambientes
        const produtos = [];
        document.querySelectorAll("#tabelasAmbientes .ambiente-container").forEach(container => {
            const ambiente = container.querySelector("h4").innerText.trim();
            container.querySelectorAll("tbody tr").forEach((row) => {
                const nomeProduto = row.querySelector("td:nth-child(3)")?.innerText.trim() || '';
                const codigoProduto = row.querySelector("td:nth-child(4)")?.innerText.trim() || '';
                const codigoInterno = row.querySelector("td:nth-child(5)")?.innerText.trim() || '';
                const valorUnitario = parseFloat(row.querySelector(".valorUnitario")?.innerText.replace(/[^\d,.-]/g, '').replace(',', '.') || 0);
                const quantidade = parseFloat(row.querySelector(".quantidadeProduto")?.value || 0);
                const valorTotal = parseFloat(row.querySelector(".valorTotal")?.innerText.replace(/[^\d,.-]/g, '').replace(',', '.') || 0);
                let observacao = '';

                // Verificar observação
                const nextRow = row.nextElementSibling;
                if (nextRow && nextRow.classList.contains('observacao-row')) {
                    observacao = nextRow.querySelector('textarea')?.value.trim() || '';
                }

                if (nomeProduto && !isNaN(valorUnitario) && !isNaN(quantidade) && !isNaN(valorTotal)) {
                    produtos.push({
                        nomeProduto,
                        codigoProduto,
                        codigoInterno,
                        valorUnitario,
                        quantidade,
                        valorTotal,
                        observacao,
                        ambiente,
                        statusSeparacao: 'Aberto'
                    });
                }
            });
        });

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
            codigoClienteOmie: document.getElementById('idClienteOmie').value.trim(),
            status: 'Aberto',
        };

        console.log('Enviando pedido para salvar:', JSON.stringify(pedido, null, 2)); // Log detalhado para ver o pedido sendo enviado

        // Fazer a requisição de atualização do pedido
        const response = await fetch(`https://acropoluz-one-cdc9c4e154cc.herokuapp.com/pedido/${idPedido}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });

        // Analisar a resposta
        if (response.ok) {
            alert('Proposta atualizada com sucesso!');
            window.location.reload();
        } else {
            const errorData = await response.json();
            console.error('Erro ao atualizar a proposta:', errorData);
            alert(`Erro ao atualizar a proposta: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        alert('Erro ao se conectar ao servidor. Tente novamente mais tarde.');
    }
}



function verificarValoresTabela() {
    // Selecionar todas as células da tabela que possam conter valores
    const valores = document.querySelectorAll("#tabelasAmbientes .valorUnitario, #tabelasAmbientes .valorTotal");

    for (let i = 0; i < valores.length; i++) {
        const valorTexto = valores[i].innerText.trim().replace(',', '.');
        const valorNumerico = parseFloat(valorTexto);

        // Verificar se o valor é 0,00, 0.00, ou 0
        if (isNaN(valorNumerico) || valorNumerico === 0) {
            alert("Produto com valor 0,00 encontrado. Por favor, ajuste o valor.");
            return false; // Interrompe a execução da função que chamou
        }
    }

    return true; // Se não houver valores inválidos, permitir a execução da função que chamou
}

// Função para ser chamada ao tentar salvar a proposta
function salvarProposta() {
    // Verificar se há valores inválidos na tabela
  

    // Caso não haja valores inválidos, continuar com o salvamento
    console.log("Salvando a proposta...");
    // Coloque aqui o restante do código para salvar a proposta
}


function gerarPaginaOrcamento() {
    // Verificar se existe algum valor igual a 0,00 na tabela
    const temValorZero = [...document.querySelectorAll('.valorUnitario, .valorTotal')].some(cell => {
        const valor = parseFloat(cell.innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
        return valor === 0 || isNaN(valor);
    });

    if (temValorZero) {
        alert('Um produto com valor 0,00 está presente. Por favor, corrija antes de gerar a folha de proposta.');
        return;
    }

    // Obter as informações do cliente e do pedido
    const nomeCliente = document.getElementById('nome').value;
    const cpfCnpj = document.getElementById('cpfCnpj').value;
    const endereco = document.getElementById('endereco').value;
    const numeroComplemento = document.getElementById('numeroComplemento').value;
    const telefone = document.getElementById('telefone').value;
    const tipoEntrega = document.getElementById('tipoEntrega').value;
    const valorFrete = document.getElementById('valorFrete').value;
    const vendedor = document.getElementById('selectVendedor').value;
    const agenteArquiteto = document.getElementById('agenteArquiteto').value;
    const dataEntrega = document.getElementById('dataEntrega').value;
    const tipoPagamento = document.getElementById('tipoPagamento').value;
    const desconto = parseFloat(document.getElementById('desconto').value);

    // Obter as tabelas de produtos separados por ambiente e os totalizadores
    const ambientes = document.querySelectorAll('.ambiente-container');
    let tabelasAmbientesHtml = '';

    ambientes.forEach(ambiente => {
        const ambienteNome = ambiente.querySelector('h4').innerText.replace('Excluir Ambiente', '').trim();
        const linhasTabela = ambiente.querySelectorAll('tbody tr');
        let linhasTabelaHtml = '';

        linhasTabela.forEach(row => {
            let nomeProduto = row.querySelector('td:nth-child(3)').innerText.trim();
            const codigoInterno = row.querySelector('td:nth-child(4)').innerText.trim();
            const valorUnitario = row.querySelector('.valorUnitario').innerText.replace(/[^\d,.-]/g, '').replace(',', '.');
            const quantidade = row.querySelector('.quantidadeProduto').value;
            const valorTotal = row.querySelector('.valorTotal').innerText.replace(/[^\d,.-]/g, '').replace(',', '.');
            const observacao = row.querySelector('textarea') ? row.querySelector('textarea').value.trim() : '';

            // Filtrar o nome do produto: remover "**" e limitar aos 10 primeiros caracteres
            nomeProduto = nomeProduto.replace(/\*\*/g, '').substring(0, 10);

            linhasTabelaHtml += `
                <tr>
                    <td>${nomeProduto}</td>
                    <td>${codigoInterno}</td>
                    <td>${parseFloat(valorUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${quantidade}</td>
                    <td>${parseFloat(valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>${observacao}</td>
                </tr>
            `;
        });

        tabelasAmbientesHtml += `
            <div class="ambiente-container">
                <h4 class="text-center text-uppercase" style="font-weight: bold;">${ambienteNome}</h4>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Nome do Produto</th>
                            <th>Código Interno</th>
                            <th>Valor Unitário</th>
                            <th>QT</th>
                            <th>Valor Total</th>
                            <th>Observação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasTabelaHtml}
                    </tbody>
                </table>
                ${ambiente.querySelector('.total-ambiente-bar').outerHTML}
                <br>
            </div>
        `;
    });

    // Calcular total geral e aplicar desconto
    const totalGeral = parseFloat(document.getElementById('total-geral').innerText.replace(/[^\d,.-]/g, '').replace(',', '.'));
    const totalComDesconto = desconto > 0 ? totalGeral * (1 - desconto / 100) : totalGeral;

    // Criar a estrutura HTML da nova página de orçamento
    const novaPaginaHtml = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Orçamento - Visualização</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 10px;
                }
                .logo-container {
                    width: 100%;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo-container img {
                    max-width: 100%;
                    height: auto;
                }
                .ambiente-container h4 {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: bold;
                }
                .total-ambiente-bar, .total-geral-bar {
                    width: 100%;
                    font-size: 1.2rem;
                    font-weight: bold;
                    background-color: #878c91;
                    color: #ffffff;
                    padding: 15px;
                    margin-top: 10px;
                    text-align: center;
                }
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        margin: 0;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid #000 !important;
                    }
                }
                table {
                    width: 100%;
                    margin-bottom: 20px;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <!-- Logo -->
            <div class="logo-container">
                <img src="WhatsApp Image 2024-09-30 at 3.06.27 PM.jpeg" alt="Logo">
            </div>

            <div class="container my-5">
                <!-- Informações do Cliente -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h3>Informações do Cliente</h3>
                        <p><strong>Nome:</strong> ${nomeCliente}</p>
                        <p><strong>CPF/CNPJ:</strong> ${cpfCnpj}</p>
                        <p><strong>Endereço:</strong> ${endereco}, ${numeroComplemento}</p>
                        <p><strong>Telefone:</strong> ${telefone}</p>
                        <p><strong>Tipo de Entrega:</strong> ${tipoEntrega}</p>
                        <p><strong>Valor do Frete:</strong> ${valorFrete ? parseFloat(valorFrete).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não definido'}</p>
                    </div>
                    <div class="col-md-6">
                        <h3>Informações do Pedido</h3>
                        <p><strong>Vendedor:</strong> ${vendedor}</p>
                        <p><strong>Agente/Arquiteto:</strong> ${agenteArquiteto}</p>
                        <p><strong>Data de Previsão de Entrega:</strong> ${new Date(dataEntrega).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Tipo de Pagamento:</strong> ${tipoPagamento}</p>
                    </div>
                </div>
                <hr>
                <!-- Tabelas dos Ambientes -->
                ${tabelasAmbientesHtml}
                <div class="total-geral-bar mt-4">Total Geral: R$ ${totalGeral.toFixed(2).replace('.', ',')}</div>
                ${desconto > 0 ? `<div class="total-geral-bar mt-4">Total com Desconto Aplicado: R$ ${totalComDesconto.toFixed(2).replace('.', ',')}</div>` : ''}
            </div>
        </body>
        </html>
    `;

    // Abrir a nova página em uma aba para visualização
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(novaPaginaHtml);
    novaJanela.document.close();

    // Configurar para impressão com margens mínimas e escala personalizada
    novaJanela.onload = function () {
        novaJanela.print();
    };
}


function gerarPaginaOrcamentoSemValores() {
    // Obter as informações do cliente e do pedido
    const nomeCliente = document.getElementById('nome').value;
    const cpfCnpj = document.getElementById('cpfCnpj').value;
    const endereco = document.getElementById('endereco').value;
    const numeroComplemento = document.getElementById('numeroComplemento').value;
    const telefone = document.getElementById('telefone').value;
    const tipoEntrega = document.getElementById('tipoEntrega').value;
    const vendedor = document.getElementById('selectVendedor').value;
    const agenteArquiteto = document.getElementById('agenteArquiteto').value;
    const dataEntrega = document.getElementById('dataEntrega').value;

    // Obter as tabelas de produtos separados por ambiente e os totalizadores
    const ambientes = document.querySelectorAll('.ambiente-container');
    let tabelasAmbientesHtml = '';

    ambientes.forEach(ambiente => {
        const ambienteNome = ambiente.querySelector('h4').innerText.replace('Excluir Ambiente', '').trim();
        const linhasTabela = ambiente.querySelectorAll('tbody tr');
        let linhasTabelaHtml = '';

        linhasTabela.forEach(row => {
            let nomeProduto = row.querySelector('td:nth-child(3)').innerText.trim();
            const quantidade = row.querySelector('.quantidadeProduto').value;
            const observacao = row.querySelector('textarea') ? row.querySelector('textarea').value.trim() : '';

            // Filtrar o nome do produto: remover "**" e limitar aos 10 primeiros caracteres
            nomeProduto = nomeProduto.replace(/\*\*/g, '').substring(0, 10);

            linhasTabelaHtml += `
                <tr>
                    <td>${nomeProduto}</td>
                    <td>${quantidade}</td>
                    <td>${observacao}</td>
                </tr>
            `;
        });

        tabelasAmbientesHtml += `
            <div class="ambiente-container">
                <h4 class="text-center text-uppercase" style="font-weight: bold;">${ambienteNome}</h4>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Nome do Produto</th>
                            <th>Quantidade</th>
                            <th>Observação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasTabelaHtml}
                    </tbody>
                </table>
                <br>
            </div>
        `;
    });

    // Criar a estrutura HTML da nova página de orçamento
    const novaPaginaHtml = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Orçamento - Visualização</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 10px;
                }
                .logo-container {
                    width: 100%;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo-container img {
                    max-width: 100%;
                    height: auto;
                }
                .ambiente-container h4 {
                    text-align: center;
                    text-transform: uppercase;
                    font-weight: bold;
                }
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        margin: 0;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid #000 !important;
                    }
                }
                table {
                    width: 100%;
                    margin-bottom: 20px;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <!-- Logo -->
            <div class="logo-container">
                <img src="WhatsApp Image 2024-09-30 at 3.06.27 PM.jpeg" alt="Logo">
            </div>

            <div class="container my-5">
                <!-- Informações do Cliente -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h3>Informações do Cliente</h3>
                        <p><strong>Nome:</strong> ${nomeCliente}</p>
                        <p><strong>CPF/CNPJ:</strong> ${cpfCnpj}</p>
                        <p><strong>Endereço:</strong> ${endereco}, ${numeroComplemento}</p>
                        <p><strong>Telefone:</strong> ${telefone}</p>
                        <p><strong>Tipo de Entrega:</strong> ${tipoEntrega}</p>
                    </div>
                    <div class="col-md-6">
                        <h3>Informações do Pedido</h3>
                        <p><strong>Vendedor:</strong> ${vendedor}</p>
                        <p><strong>Agente/Arquiteto:</strong> ${agenteArquiteto}</p>
                        <p><strong>Data de Previsão de Entrega:</strong> ${new Date(dataEntrega).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                <hr>
                <!-- Tabelas dos Ambientes -->
                ${tabelasAmbientesHtml}
            </div>
        </body>
        </html>
    `;

    // Abrir a nova página em uma aba para visualização
    const novaJanela = window.open('', '_blank');
    novaJanela.document.write(novaPaginaHtml);
    novaJanela.document.close();

    // Configurar para impressão com margens mínimas e escala personalizada
    novaJanela.onload = function () {
        novaJanela.print();
    };
}
