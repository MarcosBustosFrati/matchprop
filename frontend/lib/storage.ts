const KEY = "matchprop_local";

type Store = {
  lastValuations: any[];
  favorites: any[];
  comparables: any[];
};

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lastValuations: [], favorites: [], comparables: [] };
    return JSON.parse(raw);
  } catch { return { lastValuations: [], favorites: [], comparables: [] }; }
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const store = {
  pushValuation(v: any) {
    const s = read();
    s.lastValuations = [v, ...s.lastValuations].slice(0, 10);
    write(s); return s;
  },
  addFavorite(item: any) {
    const s = read();
    s.favorites = [item, ...s.favorites].slice(0, 50);
    write(s); return s;
  },
  setComparables(rows: any[]) {
    const s = read();
    s.comparables = rows;
    write(s); return s;
  },
  read,
};
