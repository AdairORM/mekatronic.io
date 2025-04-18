// ----- Datos Base de la NOM -----
// Ampacidad aproximada por tipo de material y aislamiento
const ampacityTable = {
    'copper': {
      'THW-LS_75': { '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100, '2': 115, '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230 },
      'THHN_90':   { '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 110, '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260 }
    },
    'aluminum': {
      'THW-LS_75': { '12': 20, '10': 25, '8': 40, '6': 50, '4': 65, '3': 75, '2': 90, '1': 100, '1/0': 120, '2/0': 135, '3/0': 155, '4/0': 180 },
      'THHN_90':   { '12': 25, '10': 30, '8': 45, '6': 60, '4': 75, '3': 85, '2': 100, '1': 115, '1/0': 135, '2/0': 150, '3/0': 175, '4/0': 205 }
    }
  };
  
  const tempCorrectionFactors = {
    'THW-LS_75': { 21: 1.08, 26: 1.04, 31: 0.96, 36: 0.91, 41: 0.87, 46: 0.82, 51: 0.76, 56: 0.71 },
    'THHN_90':   { 21: 1.05, 26: 1.04, 31: 0.96, 36: 0.94, 41: 0.91, 46: 0.88, 51: 0.85, 56: 0.82 }
  };
  
  const groupingFactors = { 3: 1.0, 6: 0.8, 9: 0.7, 24: 0.6, 42: 0.5 };
  
  const resistanceOhmsPerKm = {
    'copper':   { '14': 10.6, '12': 6.69, '10': 4.2, '8': 2.62, '6': 1.64, '4': 1.05, '3': 0.827, '2': 0.656, '1': 0.525, '1/0': 0.413, '2/0': 0.331, '3/0': 0.262, '4/0': 0.207 },
    'aluminum': { '12': 11.0, '10': 6.92, '8': 4.33, '6': 2.72, '4': 1.74, '3': 1.36, '2': 1.08, '1': 0.853, '1/0': 0.676, '2/0': 0.535, '3/0': 0.427, '4/0': 0.338 }
  };
  
  const awgSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0'];
  const awgSizesAluminum = ['12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0'];
  
  function getSafeValue(id, isNumeric = true) {
    const value = document.getElementById(id)?.value;
    if (!value) return null;
    return isNumeric ? Number(value) || null : value;
  }
  
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
    const input = document.getElementById(id.replace('error-', ''));
    if (input) input.classList.add('border-red-500');
  }
  
  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    document.querySelectorAll('input, select').forEach(e => e.classList.remove('border-red-500'));
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('general-error-section').classList.add('hidden');
    document.getElementById('result-warning').textContent = '';
    document.getElementById('result-warning').classList.add('hidden');
  }
  
  function getTempCorrectionFactor(insulation, temp) {
    const data = tempCorrectionFactors[insulation];
    if (!data) return 1;
    let key = Object.keys(data).map(Number).filter(k => temp >= k).sort((a, b) => b - a)[0];
    return key ? data[key] : 1;
  }
  
  function getGroupingFactor(n) {
    if (n <= 3) return 1.0;
    if (n <= 6) return groupingFactors[6];
    if (n <= 9) return groupingFactors[9];
    if (n <= 24) return groupingFactors[24];
    return groupingFactors[42];
  }
  
  function getResistance(material, gauge) {
    return resistanceOhmsPerKm[material]?.[gauge] || null;
  }
  
  function getBaseAmpacity(material, insulation, gauge) {
    if (material === 'aluminum' && gauge === '14') return null;
    return ampacityTable[material]?.[insulation]?.[gauge] || null;
  }
  
  function validateInputs(inputs) {
    let valid = true;
    if (!inputs.current || inputs.current <= 0) {
      showError('error-current', 'Corriente inválida.');
      valid = false;
    }
    if (!inputs.voltage) {
      showError('error-voltage', 'Tensión requerida.');
      valid = false;
    }
    if (!inputs.phases) {
      showError('error-phases', 'Fases inválidas.');
      valid = false;
    }
    if (!inputs.length || inputs.length <= 0) {
      showError('error-length', 'Longitud inválida.');
      valid = false;
    }
    if (!inputs.voltageDrop || inputs.voltageDrop <= 0 || inputs.voltageDrop > 15) {
      showError('error-voltageDrop', 'Caída de tensión entre 1 y 15%.');
      valid = false;
    }
    if (!inputs.material) {
      showError('error-material', 'Material requerido.');
      valid = false;
    }
    if (!inputs.insulation) {
      showError('error-insulation', 'Aislamiento requerido.');
      valid = false;
    }
    if (inputs.temperature === null) {
      showError('error-temperature', 'Temperatura inválida.');
      valid = false;
    }
    if (!inputs.conductors || inputs.conductors < 1) {
      showError('error-conductors', 'Conductores inválido.');
      valid = false;
    }
    if (!inputs.installation) {
      showError('error-installation', 'Método de instalación requerido.');
      valid = false;
    }
    return valid;
  }
  
  function calculateGauge(e) {
    e.preventDefault();
    clearErrors();
  
    const inputs = {
      current: getSafeValue('current'),
      voltage: getSafeValue('voltage'),
      phases: parseInt(getSafeValue('phases', false)),
      length: getSafeValue('length'),
      voltageDrop: getSafeValue('voltageDrop'),
      material: getSafeValue('material', false),
      insulation: getSafeValue('insulation', false),
      temperature: getSafeValue('temperature'),
      conductors: getSafeValue('conductors'),
      installation: getSafeValue('installation', false)
    };
  
    if (!validateInputs(inputs)) {
      document.getElementById('general-error-section').classList.remove('hidden');
      return;
    }
  
    const availableSizes = inputs.material === 'aluminum' ? awgSizesAluminum : awgSizes;
    const tempFactor = getTempCorrectionFactor(inputs.insulation, inputs.temperature);
    const groupFactor = getGroupingFactor(inputs.conductors);
  
    let gaugeByAmpacity = null;
    let adjustedAmpacity = null;
  
    for (const gauge of availableSizes) {
      const baseAmpacity = getBaseAmpacity(inputs.material, inputs.insulation, gauge);
      if (baseAmpacity === null) continue;
      const adjusted = baseAmpacity * tempFactor * groupFactor;
      if (adjusted >= inputs.current) {
        gaugeByAmpacity = gauge;
        adjustedAmpacity = adjusted;
        break;
      }
    }
  
    if (!gaugeByAmpacity) {
      document.getElementById('general-error-section').classList.remove('hidden');
      document.getElementById('general-error-message').textContent = 'No se encontró un calibre válido por ampacidad.';
      return;
    }
  
    let gaugeByVD = null;
    let vdVolts = 0;
    let vdPercent = 0;
  
    const start = availableSizes.indexOf(gaugeByAmpacity);
    for (let i = start; i < availableSizes.length; i++) {
      const gauge = availableSizes[i];
      const R = getResistance(inputs.material, gauge);
      if (!R) continue;
  
      const factor = inputs.phases === 3 ? Math.sqrt(3) : 2;
      const Rm = R / 1000;
      const Vd = factor * inputs.length * inputs.current * Rm;
      const VdPct = (Vd / inputs.voltage) * 100;
  
      if (VdPct <= inputs.voltageDrop) {
        gaugeByVD = gauge;
        vdVolts = Vd;
        vdPercent = VdPct;
        break;
      }
    }
  
    if (!gaugeByVD) {
      document.getElementById('general-error-section').classList.remove('hidden');
      document.getElementById('general-error-message').textContent = 'No se cumple la caída de tensión.';
      return;
    }
  
    const finalIndex = Math.max(availableSizes.indexOf(gaugeByAmpacity), availableSizes.indexOf(gaugeByVD));
    const finalGauge = availableSizes[finalIndex];
    const baseAmp = getBaseAmpacity(inputs.material, inputs.insulation, finalGauge);
    const finalAmp = baseAmp * tempFactor * groupFactor;
    const finalR = getResistance(inputs.material, finalGauge);
    const finalVd = (inputs.phases === 3 ? Math.sqrt(3) : 2) * inputs.length * inputs.current * finalR / 1000;
    const finalVdPct = (finalVd / inputs.voltage) * 100;
  
    document.getElementById('result-gauge').textContent = finalGauge;
    document.getElementById('result-limiting-factor').textContent = finalIndex > availableSizes.indexOf(gaugeByAmpacity) ? "Caída de Tensión" : "Ampacidad";
    document.getElementById('result-ampacity').textContent = finalAmp.toFixed(2);
    document.getElementById('result-voltage-drop-percent').textContent = finalVdPct.toFixed(2);
    document.getElementById('result-voltage-drop-volts').textContent = finalVd.toFixed(2);
  
    if (finalAmp < inputs.current * 1.05) {
      const warn = document.getElementById('result-warning');
      warn.textContent = '⚠️ La ampacidad corregida está muy cerca de la corriente de carga.';
      warn.classList.remove('hidden');
    }
  
    document.getElementById('results-section').classList.remove('hidden');
  }
  
  document.getElementById('calculator-form').addEventListener('submit', calculateGauge);
  