  
  function alugarBike(chave) {
    const bike = catalogoBikes[chave];
  
    if (!bike) {
      console.error(`Bike "${chave}" não encontrada no catálogo.`);
      return;
    }

    try {
      localStorage.setItem("bikeSelecionada", JSON.stringify(bike));
    } catch (erro) {

    }
  
    window.location.href = `./alugar.html?bike=${chave}`;
  }

const catalogoBikes = {
    trekXcal29: {
      tipo: "mountain bike",
      nome: "Trek X-Cal 29",
      preco: 45,
      imagem: "https://images.unsplash.com/photo-1673121414328-52eff37bc6d0?w=600&h=400&fit=crop&auto=format"
    },
    cityClassicUrban: {
      tipo: "bicicleta urbana",
      nome: "City Classic Urban",
      preco: 28,
      imagem: "https://images.unsplash.com/photo-1591047139334-337807f2b3e5?w=600&h=400&fit=crop&auto=format"
    },
    kboEBikeBreeze: {
      tipo: "elétrica",
      nome: "KBO E-Bike Breeze",
      preco: 75,
      imagem: "https://images.unsplash.com/photo-1620802051782-725fa33db067?w=600&h=400&fit=crop&auto=format"
    }
  };
  
  const bikePadrao = catalogoBikes.trekXcal29;
  
  let bikeAtual = bikePadrao;
  
  document.addEventListener("DOMContentLoaded", () => {
    const estaNaPaginaDeAluguel = document.getElementById("tipo-bike") !== null;

    if (estaNaPaginaDeAluguel) {
      carregarBikeSelecionada();
      configurarDatas();
      atualizarResumo();
      configurarModal();
    }
  });
  
  function carregarBikeSelecionada() {
    const parametros = new URLSearchParams(window.location.search);
    const chaveNaUrl = parametros.get("bike");
  
    if (chaveNaUrl && catalogoBikes[chaveNaUrl]) {
      bikeAtual = catalogoBikes[chaveNaUrl];
      renderizarBike(bikeAtual);
      return;
    }
  
    try {
      const dadosSalvos = localStorage.getItem("bikeSelecionada");
      if (dadosSalvos) {
        bikeAtual = JSON.parse(dadosSalvos);
      }
    } catch (erro) {
      bikeAtual = bikePadrao;
    }
  
    renderizarBike(bikeAtual);
  }
  
  function renderizarBike(bike) {
    document.getElementById("tipo-bike").textContent = bike.tipo;
    document.getElementById("nome-bike").textContent = bike.nome;
    document.getElementById("preco").innerHTML = `${formatarMoeda(bike.preco)} <small>/dia</small>`;
  
    const imagem = document.querySelector(".img_bike");
    imagem.src = bike.imagem;
    imagem.alt = bike.nome;
  }
  
  /* ------------------------------------------------------------
     2) DATAS, DIAS E VALOR TOTAL
  ------------------------------------------------------------- */
  function configurarDatas() {
    const hoje = new Date().toISOString().split("T")[0];
    const inputRetirada = document.getElementById("data-retirada");
    const inputDevolucao = document.getElementById("data-devolucao");
  
    inputRetirada.min = hoje;
    inputDevolucao.min = hoje;
  
    inputRetirada.addEventListener("change", () => {
      inputDevolucao.min = inputRetirada.value;
  
      if (inputDevolucao.value && inputDevolucao.value < inputRetirada.value) {
        inputDevolucao.value = "";
      }
  
      atualizarResumo();
    });
  
    inputDevolucao.addEventListener("change", atualizarResumo);
  }
  
  function calcularDias() {
    const retirada = document.getElementById("data-retirada").value;
    const devolucao = document.getElementById("data-devolucao").value;
  
    if (!retirada || !devolucao) return 0;
  
    const msPorDia = 1000 * 60 * 60 * 24;
    const diferenca = Math.round((new Date(devolucao) - new Date(retirada)) / msPorDia);
  
    return diferenca > 0 ? diferenca : 1;
  }
  
  function atualizarResumo() {
    const dias = calcularDias();
  
    const resumoDias = document.getElementById("resumo-dias");
    const resumoTotal = document.getElementById("resumo-total");
    const diasTopo = document.getElementById("dias");
    const valorTotalTopo = document.getElementById("valor-total");
  
    if (dias === 0) {
      resumoDias.textContent = "Selecione as datas";
      resumoTotal.textContent = formatarMoeda(0);
      diasTopo.textContent = "-- dias";
      valorTotalTopo.textContent = formatarMoeda(0);
      return;
    }
  
    const total = dias * bikeAtual.preco;
    const sufixoDias = dias > 1 ? "dias" : "dia";
  
    resumoDias.textContent = `${dias} ${sufixoDias} × ${formatarMoeda(bikeAtual.preco)}`;
    resumoTotal.textContent = formatarMoeda(total);
    diasTopo.textContent = `${dias} ${sufixoDias}`;
    valorTotalTopo.textContent = formatarMoeda(total);
  }
  
  function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  
  /* ------------------------------------------------------------
     3) VALIDAÇÃO + MODAL DE CONFIRMAÇÃO
  ------------------------------------------------------------- */
  function AbrirModal() {
    const camposObrigatorios = [
      "nome", "tel", "cep", "logradouro", "num",
      "bairro", "cidade", "estado",
      "data-retirada", "h-retirada", "data-devolucao"
    ];
  
    let formularioValido = true;
  
    camposObrigatorios.forEach((id) => {
      const campo = document.getElementById(id);
      if (!campo.value.trim()) {
        campo.classList.add("invalido");
        formularioValido = false;
      } else {
        campo.classList.remove("invalido");
      }
    });
  
    if (calcularDias() === 0) {
      formularioValido = false;
    }
  
    if (!formularioValido) {
      alert("Preencha todos os campos obrigatórios e selecione as datas antes de confirmar.");
      return;
    }
  
    const nome = document.getElementById("nome").value.trim();
    document.getElementById("modal-nome").textContent = nome;
    document.getElementById("modal-bike").textContent = bikeAtual.nome;
  
    document.getElementById("modal-overlay").classList.add("ativo");
    document.body.style.overflow = "hidden";
  }
  
  function fecharModal() {
    document.getElementById("modal-overlay").classList.remove("ativo");
    document.body.style.overflow = "";
  }
  
  function voltarCatalogo() {
    localStorage.removeItem("bikeSelecionada");
    window.location.href = "./index.html";
  }
  
  // Liga os eventos do modal que existiam no código mas nunca eram
  // chamados por nenhum elemento: fechar clicando fora e com a tecla Esc.
  function configurarModal() {
    const overlay = document.getElementById("modal-overlay");
  
    overlay.addEventListener("click", (evento) => {
      if (evento.target === overlay) {
        fecharModal();
      }
    });
  
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && overlay.classList.contains("ativo")) {
        fecharModal();
      }
    });
  }