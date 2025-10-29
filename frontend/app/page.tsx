"use client";
import { useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [valuation, setValuation] = useState<any>(null);
  const [matchResults, setMatchResults] = useState<any>(null);

  async function handleValuate(e: any) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      property_type: form.get("property_type"),
      covered_m2: Number(form.get("covered_m2")),
      uncovered_m2: Number(form.get("uncovered_m2") || 0),
      neighborhood: form.get("neighborhood"),
    };
    const { data } = await axios.post(`${API}/api/v1/valuate`, payload);
    setValuation(data);
  }

  async function handleMatch(e: any) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      budget_usd: Number(form.get("budget_usd")),
      rooms: Number(form.get("rooms") || 0),
      neighborhood_pref: (form.get("neighborhood_pref") as string)?.split(",").map(s=>s.trim()),
      min_roi: Number(form.get("min_roi") || 0)
    };
    const { data } = await axios.post(`${API}/api/v1/match`, payload);
    setMatchResults(data);
  }

  return (
    <main style={{padding:16}}>
      <h1>MatchProp – MVP</h1>
      <p>Valuador y Matching para CABA</p>

      <div style={{display:"grid", gap:16, gridTemplateColumns:"1fr 1fr", marginTop:16}}>
        <form onSubmit={handleValuate} style={{border:"1px solid #ddd", padding:16, borderRadius:12}}>
          <h2>Valuación</h2>
          <input name="property_type" placeholder="Tipo" />
          <input name="covered_m2" placeholder="m² cubiertos" type="number" />
          <input name="uncovered_m2" placeholder="m² descubiertos" type="number" />
          <input name="neighborhood" placeholder="Barrio" />
          <button>Valuar</button>
          {valuation && <pre>{JSON.stringify(valuation, null, 2)}</pre>}
        </form>

        <form onSubmit={handleMatch} style={{border:"1px solid #ddd", padding:16, borderRadius:12}}>
          <h2>Match Finder</h2>
          <input name="budget_usd" placeholder="Presupuesto USD" type="number" />
          <input name="rooms" placeholder="Ambientes" type="number" />
          <input name="neighborhood_pref" placeholder="Barrios preferidos (coma)" />
          <input name="min_roi" placeholder="ROI mínimo (%)" type="number" />
          <button>Buscar Match</button>
          {matchResults?.matches && <pre>{JSON.stringify(matchResults, null, 2)}</pre>}
        </form>
      </div>
    </main>
  );
}
