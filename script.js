const baseURL = "https://opendatasus.saude.gov.br/api/v1/";
const token = ""; // Não necessário para openDataSUS public

const sidebar = document.getElementById("sidebar");
const toggleMenuBtn = document.getElementById("toggleMenu");
const menuButtons = document.querySelectorAll(".menu-items button");
const sections = document.querySelectorAll(".section");

toggleMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

menuButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    menuButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const sectionId = btn.getAttribute("data-section");
    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
  });
});

let chartCasos = null;
let chartVacinas = null;
let chartHospitais = null;

// Função criar gráfico barra azul com texto branco e fundo azul
function criarGraficoBarra(ctx, labels, data, labelTexto) {
  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: labelTexto,
        data: data,
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: 8,
        maxBarThickness: 40,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "white",
            font: {
              size: 14,
              weight: "bold"
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: "white",
          titleColor: "#0a75d1",
          bodyColor: "#0a75d1",
          titleFont: { weight: "bold", size: 14 },
          bodyFont: { size: 12 },
          padding: 8,
          cornerRadius: 6,
        }
      },
      scales: {
        x: {
          ticks: {
            color: "white",
            font: { size: 14, weight: "bold" }
          },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "white",
            font: { size: 14, weight: "bold" },
            stepSize: 1,
          },
          grid: {
            color: "rgba(255,255,255,0.3)",
            borderColor: "rgba(255,255,255,0.5)",
          }
        }
      }
    }
  });
}

// BUSCAR e mostrar Casos por Estado
async function fetchCasos() {
  const container = document.getElementById("casosContainer");
  try {
    const res = await fetch("https://opendatasus.saude.gov.br/api/v1/caso/data", { method: "GET" });
    if (!res.ok) throw new Error("Erro ao buscar casos");
    const json = await res.json();

    // Pega só os dados por estado mais recentes
    const dados = json.filter(item => item.tipo == "casos").slice(0, 27);
    
    // Mapear estado e total de casos confirmados
    let estados = [];
    let casos = [];
    dados.forEach(item => {
      estados.push(item.sigla_uf);
      casos.push(item.total);
    });

    container.textContent = `Total de Estados com dados: ${estados.length}`;

    // Criar gráfico
    const ctx = document.getElementById("casosChart").getContext("2d");
    if(chartCasos) chartCasos.destroy();
    chartCasos = criarGraficoBarra(ctx, estados, casos, "Casos Confirmados");

  } catch (e) {
    container.textContent = "Erro ao carregar casos.";
    console.error(e);
  }
}

// BUSCAR e mostrar Vacinação por Estado
async function fetchVacinas() {
  const container = document.getElementById("vacinasContainer");
  try {
    // API oficial para vacinação
    const res = await fetch("https://opendatasus.saude.gov.br/api/v1/vacina/data", { method: "GET" });
    if (!res.ok) throw new Error("Erro ao buscar vacinas");
    const json = await res.json();

    // Pega os dados mais recentes por estado
    // Note: a API muda, e a chave pode ser diferente, adaptamos para campos comuns:
    const dadosEstados = json.filter(item => item.tipo == "vacinas").slice(0, 27);

    let estados = [];
    let doses = [];
    dadosEstados.forEach(item => {
      estados.push(item.sigla_uf);
      doses.push(item.total_doses);
    });

    container.textContent = `Total de Estados com dados de vacinação: ${estados.length}`;

    // Criar gráfico
    const ctx = document.getElementById("vacinasChart").getContext("2d");
    if(chartVacinas) chartVacinas.destroy();
    chartVacinas = criarGraficoBarra(ctx, estados, doses, "Doses Aplicadas");

  } catch (e) {
    container.textContent = "Erro ao carregar vacinação.";
    console.error(e);
  }
}

// BUSCAR e mostrar Hospitais e Leitos por Estado
async function fetchHospitais() {
  const container = document.getElementById("hospitaisContainer");
  try {
    // API hospitais / leitos (exemplo, dado real depende da API do OpenDataSUS)
    const res = await fetch("https://opendatasus.saude.gov.br/api/v1/leitos/data", { method: "GET" });
    if (!res.ok) throw new Error("Erro ao buscar hospitais e leitos");
    const json = await res.json();

    // Pega dados recentes
    const dadosEstados = json.slice(0, 27);

    let estados = [];
    let leitos = [];
    dadosEstados.forEach(item => {
      estados.push(item.sigla_uf);
      leitos.push(item.leitos_existentes || 0);
    });

    container.textContent = `Total de Estados com dados de leitos: ${estados.length}`;

    // Criar gráfico
    const ctx = document.getElementById("hospitaisChart").getContext("2d");
    if(chartHospitais) chartHospitais.destroy();
    chartHospitais = criarGraficoBarra(ctx, estados, leitos, "Leitos Existentes");

  } catch (e) {
    container.textContent = "Erro ao carregar hospitais e leitos.";
    console.error(e);
  }
}

// Inicializa todos os dados e gráficos
function init() {
  fetchCasos();
  fetchVacinas();
  fetchHospitais();
}

init();
