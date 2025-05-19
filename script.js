const brasilIOToken = "f9be38771ceccd4f079f09374bb54969906edab4";

// Sidebar e navegação
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

// Função genérica para gráfico de barras
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
            font: { size: 14, weight: "bold" }
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

// BUSCAR Casos Confirmados via Brasil.IO (usando Axios)
async function fetchCasosBrasilIO() {
  const container = document.getElementById("casosContainer");
  try {
    const response = await axios.get('https://api.brasil.io/v1/dataset/covid19/caso_full/data/', {
      params: {
        is_last: true,
        place_type: 'state'
      },
      headers: {
        "Authorization": `Token ${brasilIOToken}`
      }
    });

    const resultados = response.data.results;
    const estados = resultados.map(item => item.state);
    const casos = resultados.map(item => item.last_available_confirmed);

    container.textContent = `Total de estados com dados: ${estados.length}`;

    const ctx = document.getElementById("casosChart").getContext("2d");
    if (chartCasos) chartCasos.destroy();
    chartCasos = criarGraficoBarra(ctx, estados, casos, "Casos Confirmados (Brasil.IO)");

  } catch (error) {
    container.textContent = "Erro ao carregar dados do Brasil.IO";
    console.error("Erro na API Brasil.IO:", error);
  }
}

// GERAR Gráfico de Vacinas (dados simulados)
function fetchVacinas() {
  const container = document.getElementById("vacinasContainer");
  const estados = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
                 "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
                 "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
  const doses = estados.map(() => Math.floor(Math.random() * 5000000));

  container.textContent = `Total de Estados com dados de vacinação: ${estados.length}`;
  const ctx = document.getElementById("vacinasChart").getContext("2d");
  if (chartVacinas) chartVacinas.destroy();
  chartVacinas = criarGraficoBarra(ctx, estados, doses, "Doses Aplicadas");
}

// GERAR Gráfico de Hospitais (dados simulados)
function fetchHospitais() {
  const container = document.getElementById("hospitaisContainer");
  const estados = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
                 "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
                 "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
  const leitos = estados.map(() => Math.floor(Math.random() * 10000));

  container.textContent = `Total de Estados com dados de leitos: ${estados.length}`;
  const ctx = document.getElementById("hospitaisChart").getContext("2d");
  if (chartHospitais) chartHospitais.destroy();
  chartHospitais = criarGraficoBarra(ctx, estados, leitos, "Leitos Existentes");
}

// Inicializar tudo
function init() {
  fetchCasosBrasilIO();
  fetchVacinas();
  fetchHospitais();
}

init();
