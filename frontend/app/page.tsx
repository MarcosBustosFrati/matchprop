"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { localValuation, localMatch } from "../lib/logic";
import { parseCSV, Comparable } from "../lib/csv";
import { store } from "../lib/storage";
import jsPDF from "jspdf";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [valuation, setValuation] = useState<any>(null);
  const [matchResults, setMatchResults] = useState<any>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [saved, setSaved] = useState(store.read());

  useEffect(() => {
    // Cargar comparables guardados
    setComparables(saved.comparables || []);
  }, []);

  async function handleValuate(e: any) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      property_type: String(form.get("property_type")||"depto"),
      covered_m2: Number(form.get("covered_m2")||0),
      uncovered_m2: Number(form.get("uncovered_m2")||0),
      neighborhood: String(form.get("neighborhood")||""),
    };
    let data;
    if (API) {
      ({ data } = await axios.post(`${API}/api/v1/valuate`, payload));
    } else {
      data = localValuation(payload);
    }
    setValuation(data);
    setSaved(store.pushValuation({ input: payload, output: data }));
  }

  async function handleMatch(e: any) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      budget_usd: Number(form.get("budget_usd")||0),
      rooms: Number(form.get("rooms")||0),
      neighborhood_pref: String(form.get("neighborhood_pref")||"").split(",").map(s=>s.trim()).filter(Boolean),
      min_roi: Number(form.get("min_roi")||0),
    };
    let data;
    if (API) {
      ({ data } = await axios.post(`${API}/api/v1/match`, payload));
    } else {
      data = localMatch(payload);
    }
    setMatchResults(data);
  }

  async function onCSVChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rows = await parseCSV(f);
    setComparables(rows);
    setSaved(store.setComparables(rows));
  }

  function exportPDF() {
    if (!valuation) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("MatchProp — Informe de Valuación", 14, 16);
    doc.setFontSize(11);
    doc.text(`Estimado (USD): ${valuation.estimate_usd}`, 14, 28);
    doc.text(`USD/m²: ${valuation.usd_per_m2} | Confianza: ${valuation.confidence}`, 14, 36);
    doc.text("Comparables cargados (top 3):", 14, 48);
    comparables.slice(0,3).forEach((c, i) => {
      doc.text(`• ${c.barrio || "-"} | ${c.tipo || "-"} | m2:${c.m2_cub} + ${c.m2_desc} | USD ${c.precio_usd}`, 16, 58 + i*8);
    });
    doc.save("matchprop_valuacion.pdf");
  }

  const topComparables = useMemo(() => {
    // muy simple: mismos barrios o precio por debajo del promedio
    const avg = comparables.length ? (comparables.reduce((s,c)=>s+(c.precio_usd||0),0)/comparables.length) : 0;
    return comparables
      .filter(c => (valuation?.usd_per_m2 ? true : true))
      .sort((a,b)=>(a.precio_usd||0)-(b.precio_usd||0))
      .slice(0,5);
  }, [comparables, valuation]);

  return (
    <main style={{padding:16, maxWidth:1100, margin:"0 auto"}}>
      <h1>MatchProp — MVP+</h1>
      <p>Modo: {API ? "API (Codespaces/backend)" : "Local (sin backend, 100% Pages)"}</p>

      <section style={{border:"1px solid #eee", padding:16, borderRadius:12, marginTop:16}}>
        <h2>Valuación</h2>
        <form onSubmit={handleValuate} style={{display:"grid", gap:8, gridTemplateColumns:"repeat(5, 1fr)"}}>
          <input name="property_type" placeholder="Tipo" defaultValue="depto" />
          <input name="covered_m2" placeholder="m² cubiertos" type="number" defaultValue={45} />
          <input name="uncovered_m2" placeholder="m² descubiertos" type="number" defaultValue={8} />
          <input name="neighborhood" placeholder="Barrio" defaultValue="Caballito" />
          <button>Valuar</button>
        </form>
        {valuation && (
          <div style={{marginTop:8}}>
            <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(valuation, null, 2)}</pre>
            <button onClick={exportPDF}>Exportar PDF</button>
          </div>
        )}
      </section>

      <section style={{border:"1px solid #eee", padding:16, borderRadius:12, marginTop:16}}>
        <h2>Comparables (CSV)</h2>
        <input type="file" accept=".csv" onChange={onCSVChange} />
        {topComparables?.length ? (
          <ul>
            {topComparables.map((c, idx)=>(
              <li key={idx}>
                {c.barrio || "-"} | {c.tipo || "-"} | m² {c.m2_cub}+{c.m2_desc} | USD {c.precio_usd}
                <button style={{marginLeft:8}} onClick={()=> setSaved(store.addFavorite(c))}>★ Fav</button>
              </li>
            ))}
          </ul>
        ) : <p style={{opacity:.7}}>Subí un CSV con columnas: id,barrio,tipo,m2_cub,m2_desc,precio_usd,ambientes,antiguedad,amenities</p>}
      </section>

      <section style={{border:"1px solid #eee", padding:16, borderRadius:12, marginTop:16}}>
        <h2>Favoritos / Últimas valuaciones</h2>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
          <div>
            <h3>Favoritos</h3>
            <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(saved.favorites || [], null, 2)}</pre>
          </div>
          <div>
            <h3>Últimas valuaciones</h3>
            <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(saved.lastValuations || [], null, 2)}</pre>
          </div>
        </div>
      </section>
    </main>
  );
}
