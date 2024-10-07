// URL da API de pedidos
const apiUrl = 'https://acropoluz-one-cdc9c4e154cc.herokuapp.com/pedido/';

// Função para buscar os pedidos da API e preencher a tabela
async function carregarPedidos() {
    try {
        // Fazer a requisição GET para a API
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data); // Log para verificar a estrutura da resposta

        let pedidos = [];

        // Verificar se 'data' contém a chave 'pedidos' e se é um array
        if (data.success && Array.isArray(data.pedidos)) {
            pedidos = data.pedidos;
        } else {
            throw new TypeError('Resposta da API não é uma lista de pedidos.');
        }

        // Obter o vendedor selecionado do localStorage e normalizá-lo
        const vendedorSelecionado = localStorage.getItem("vendedorSelecionado")?.trim().toLowerCase();
        console.log('Vendedor Selecionado:', vendedorSelecionado);

        // Selecionar o corpo da tabela
        const tabelaBody = document.getElementById('tabelaPedidosBody');
        tabelaBody.innerHTML = ''; // Limpa qualquer dado existente

        // Filtrar e iterar sobre os pedidos que pertencem ao vendedor selecionado
        pedidos
            .filter(pedido => {
                // Verificar se o campo informacoesOrcamento e vendedor existem
                if (pedido.informacoesOrcamento && pedido.informacoesOrcamento.vendedor) {
                    const vendedorPedido = pedido.informacoesOrcamento.vendedor.trim().toLowerCase();
                    console.log('Vendedor do Pedido:', vendedorPedido);
                    return vendedorPedido === vendedorSelecionado;
                }
                return false;
            })
            .forEach(pedido => {
                // Verificar se as propriedades necessárias existem antes de tentar acessá-las
                const cliente = pedido.cliente || {};
                const informacoesOrcamento = pedido.informacoesOrcamento || {};

                const nomeCliente = cliente.nome || 'Não informado';
                const cpfCnpj = cliente.cpfCnpj || 'Não informado';
                const numeroPedido = informacoesOrcamento.vendedor || 'Não informado';
                const valorProposta = pedido.valorProposta ? `R$ ${pedido.valorProposta}` : 'R$ 0,00';
                const dataEntrega = informacoesOrcamento.dataEntrega
                    ? new Date(informacoesOrcamento.dataEntrega).toLocaleDateString('pt-BR')
                    : 'N/A';
                const status = pedido.status || 'Aberto';

                // Criar uma nova linha
                const linha = document.createElement('tr');

                // Preencher a linha com os dados do pedido e adicionar o botão de edição
                linha.innerHTML = `
                    <td>${nomeCliente}</td>
                    <td>${cpfCnpj}</td>
                    <td>${numeroPedido}</td>
                    <td>${valorProposta}</td>
                    <td>${dataEntrega}</td>
                    <td><span class="badge ${getBadgeClass(status)}">${status}</span></td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="editarPedido('${pedido._id}')"><i class="fas fa-edit"></i> Editar</button>
                    </td>
                `;

                // Adicionar a nova linha à tabela
                tabelaBody.appendChild(linha);
            });
    } catch (error) {
        console.error('Erro ao carregar os pedidos:', error);
    }
}



// Função para definir a classe CSS com base no status do pedido
function getBadgeClass(status) {
    switch (status) {
        case 'Aberto':
            return 'bg-warning';
        case 'Perdido':
            return 'bg-danger';
        case 'Efetivado':
            return 'bg-primary';  // Status "Efetivado" agora em azul
        default:
            return 'bg-secondary';
    }
}

// Função para redirecionar para a página de edição do pedido
function editarPedido(id) {
    window.location.href = `visualizar-orcamento.html?id=${id}`;
}

// Função de pesquisa na tabela
function searchTable() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll("#tabelaPedidosBody tr");

    rows.forEach(row => {
        const cells = row.getElementsByTagName("td");
        let match = false;
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].textContent.toLowerCase().indexOf(filter) > -1) {
                match = true;
                break;
            }
        }
        row.style.display = match ? "" : "none";
    });
}

// Função de filtro por status
function filterByTag() {
    const filter = document.getElementById("filterStatus").value;
    const rows = document.querySelectorAll("#tabelaPedidosBody tr");

    rows.forEach(row => {
        const status = row.getElementsByTagName("td")[5].textContent.trim();
        row.style.display = (filter === "" || status === filter) ? "" : "none";
    });
}

// Carregar os pedidos ao carregar a página
document.addEventListener("DOMContentLoaded", carregarPedidos);
