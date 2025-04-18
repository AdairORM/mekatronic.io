document.addEventListener("DOMContentLoaded", () => {
    const tipoConductor = document.getElementById("tipoConductor");
    const tipoInstalacion = document.getElementById("tipoInstalacion");
    const temperatura = document.getElementById("temperatura");
    const agrupamiento = document.getElementById("agrupamiento");
    const corriente = document.getElementById("corriente");
    const resultadoTexto = document.getElementById("resultadoTexto");
  
    const conductores = ["Cobre", "Aluminio"];
    const instalaciones = ["Aérea", "Canalización", "Entubado", "Bajo tierra"];
    const temperaturas = [20, 25, 30, 35, 40];
    const agrupamientos = [1, 2, 3, 4, 5, 6];
  
    conductores.forEach(tipo => {
      const option = document.createElement("option");
      option.value = tipo;
      option.textContent = tipo;
      tipoConductor.appendChild(option);
    });
  
    instalaciones.forEach(tipo => {
      const option = document.createElement("option");
      option.value = tipo;
      option.textContent = tipo;
      tipoInstalacion.appendChild(option);
    });
  
    temperaturas.forEach(temp => {
      const option = document.createElement("option");
      option.value = temp;
      option.textContent = `${temp}°C`;
      temperatura.appendChild(option);
    });
  
    agrupamientos.forEach(num => {
      const option = document.createElement("option");
      option.value = num;
      option.textContent = `${num} conductores`;
      agrupamiento.appendChild(option);
    });
  
    document.getElementById("calcular").addEventListener("click", () => {
      const I = parseFloat(corriente.value);
      if (isNaN(I) || I <= 0) {
        resultadoTexto.textContent = "Por favor, ingresa una corriente válida.";
        return;
      }
  
      const conductor = tipoConductor.value;
      let factorConductor = conductor === "Cobre" ? 1 : 1.26;
  
      // Factores de corrección básicos (simplificados)
      const temp = parseInt(temperatura.value);
      let factorTemp = 1;
      if (temp >= 40) factorTemp = 0.82;
      else if (temp >= 35) factorTemp = 0.88;
      else if (temp >= 30) factorTemp = 0.94;
  
      const agrup = parseInt(agrupamiento.value);
      let factorAgrup = agrup <= 2 ? 1 : agrup <= 3 ? 0.86 : 0.75;
  
      const Iajustada = I / (factorTemp * factorAgrup);
  
      const calibre = calcularCalibre(Iajustada, conductor);
  
      resultadoTexto.textContent = `Calibre sugerido: ${calibre} AWG (${Math.ceil(Iajustada)} A ajustados)`;
    });
  
    function calcularCalibre(Iajustada, conductor) {
      // Tabla simple de capacidad de conducción para referencia
      const tabla = [
        { calibre: "14", amp: conductor === "Cobre" ? 20 : 15 },
        { calibre: "12", amp: conductor === "Cobre" ? 25 : 20 },
        { calibre: "10", amp: conductor === "Cobre" ? 35 : 28 },
        { calibre: "8", amp: conductor === "Cobre" ? 50 : 40 },
        { calibre: "6", amp: conductor === "Cobre" ? 65 : 50 },
        { calibre: "4", amp: conductor === "Cobre" ? 85 : 65 },
        { calibre: "3", amp: conductor === "Cobre" ? 100 : 75 },
        { calibre: "2", amp: conductor === "Cobre" ? 115 : 90 },
        { calibre: "1", amp: conductor === "Cobre" ? 130 : 100 },
        { calibre: "1/0", amp: conductor === "Cobre" ? 150 : 120 },
        { calibre: "2/0", amp: conductor === "Cobre" ? 175 : 135 },
        { calibre: "3/0", amp: conductor === "Cobre" ? 200 : 155 },
        { calibre: "4/0", amp: conductor === "Cobre" ? 230 : 180 }
      ];
  
      for (let i = 0; i < tabla.length; i++) {
        if (Iajustada <= tabla[i].amp) {
          return tabla[i].calibre;
        }
      }
      return "Mayor a 4/0 – consulta especializada";
    }
  });
  
