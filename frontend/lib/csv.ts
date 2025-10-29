import Papa from "papaparse";

export type Comparable = {
  id?: string;
  barrio?: string;
  tipo?: string;
  m2_cub?: number;
  m2_desc?: number;
  precio_usd?: number;
  ambientes?: number;
  antiguedad?: number;
  amenities?: string;
};

export function parseCSV(file: File): Promise<Comparable[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim(),
      complete: (res) => {
        const rows = (res.data as any[]).map(r => ({
          id: r.id?.trim?.(),
          barrio: r.barrio?.trim?.(),
          tipo: r.tipo?.trim?.(),
          m2_cub: Number(r.m2_cub ?? 0),
          m2_desc: Number(r.m2_desc ?? 0),
          precio_usd: Number(r.precio_usd ?? 0),
          ambientes: Number(r.ambientes ?? 0),
          antiguedad: Number(r.antiguedad ?? 0),
          amenities: r.amenities?.trim?.()
        }));
        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });
}
