export type ValuationInput = {
  property_type: string;
  covered_m2: number;
  uncovered_m2: number;
  neighborhood: string;
};

export type MatchInput = {
  budget_usd: number;
  rooms: number;
  neighborhood_pref: string[];
  min_roi: number;
};

export function localValuation(input: ValuationInput) {
  const barrio = (input.neighborhood || "").toLowerCase();

  // Factores súper simples por barrio para el MVP
  const barrioFactor: Record<string, number> = {
    palermo: 1.35,
    recoleta: 1.3,
    belgrano: 1.25,
    caballito: 1.1,
    almagro: 1.05,
    flores: 0.95,
    villaurquiza: 1.05,
  };

  const m2Equivalente = input.covered_m2 + 0.5 * input.uncovered_m2;
  const baseUSDm2 = 2200;
  const usd_per_m2 = Math.round(baseUSDm2 * (barrioFactor[barrio] ?? 1));
  const estimate_usd = Math.max(0, Math.round(m2Equivalente * usd_per_m2));

  return {
    estimate_usd,
    usd_per_m2,
    confidence: "demo",
    inputs: input,
  };
}

export function localMatch(input: MatchInput) {
  // Demo: genera 3 "matches" sintéticos según el presupuesto/ambientes
  const barrios = input.neighborhood_pref.length
    ? input.neighborhood_pref
    : ["Caballito", "Almagro", "Palermo"];

  const base = Math.max(1, input.rooms || 2);
  const step = Math.max(10000, Math.round(input.budget_usd * 0.08));

  const items = [0, 1, 2].map((i) => {
    const price = Math.max(40000, input.budget_usd - i * step);
    const roi = Math.max(3, Math.min(12, Math.round(5 + i * 2)));
    return {
      id: `demo-${Date.now()}-${i}`,
      barrio: barrios[i % barrios.length],
      tipo: "departamento",
      ambientes: base + i,
      m2_cub: 35 + i * 10,
      m2_desc: i * 3,
      precio_usd: price,
      roi_estimado: roi,
    };
  });

  // Filtra por ROI mínimo si lo pidió
  const filtered = items.filter((x) => x.roi_estimado >= (input.min_roi || 0));

  return {
    count: filtered.length,
    items: filtered,
    inputs: input,
  };
}
