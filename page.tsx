"use client";

import { useMemo, useState } from "react";
import { sales } from "./data";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compactMoney = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const number = new Intl.NumberFormat("pt-BR");

function unique<T>(values: T[]) {
  return Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b)));
}

function countBy<T>(items: T[], key: (item: T) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => counts.set(key(item), (counts.get(key(item)) ?? 0) + 1));
  return Array.from(counts, ([label, value]) => ({ label, value })).sort(
    (a, b) => b.value - a.value || a.label.localeCompare(b.label),
  );
}

export default function Home() {
  const [model, setModel] = useState("Todos");
  const [year, setYear] = useState("Todos");
  const [city, setCity] = useState("Todas");
  const [payment, setPayment] = useState("Todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const options = useMemo(() => ({
    models: unique(sales.map((sale) => sale.model)),
    years: unique(sales.map((sale) => sale.year)).sort((a, b) => b - a),
    cities: unique(sales.map((sale) => sale.city)),
    payments: unique(sales.map((sale) => sale.payment)),
  }), []);

  const filtered = useMemo(() => sales.filter((sale) => {
    if (model !== "Todos" && sale.model !== model) return false;
    if (year !== "Todos" && sale.year !== Number(year)) return false;
    if (city !== "Todas" && sale.city !== city) return false;
    if (payment !== "Todos" && sale.payment !== payment) return false;
    if (dateFrom && (!sale.date || sale.date < dateFrom)) return false;
    if (dateTo && (!sale.date || sale.date > dateTo)) return false;
    return true;
  }), [model, year, city, payment, dateFrom, dateTo]);

  const modelRanking = useMemo(() => countBy(filtered, (sale) => sale.model), [filtered]);
  const cityRanking = useMemo(() => countBy(filtered, (sale) => sale.city), [filtered]);
  const yearRanking = useMemo(() => countBy(filtered, (sale) => String(sale.year)), [filtered]);
  const paymentRanking = useMemo(() => countBy(filtered, (sale) => sale.payment), [filtered]);
  const revenue = filtered.reduce((sum, sale) => sum + sale.price, 0);
  const avgTicket = filtered.length ? revenue / filtered.length : 0;
  const topModel = modelRanking[0];
  const topYear = yearRanking[0];
  const topPayment = paymentRanking[0];
  const maxModelCount = Math.max(...modelRanking.slice(0, 6).map((item) => item.value), 1);
  const maxYearCount = Math.max(...yearRanking.map((item) => item.value), 1);
  const tiedModelLeaders = topModel ? modelRanking.filter((item) => item.value === topModel.value) : [];
  const cityProfiles = useMemo(() => cityRanking.slice(0, 10).map((rankedCity) => {
    const rows = filtered.filter((sale) => sale.city === rankedCity.label);
    const models = countBy(rows, (sale) => sale.model);
    const payments = countBy(rows, (sale) => sale.payment);
    const leaderCount = models[0]?.value ?? 0;
    const leaders = models.filter((item) => item.value === leaderCount);
    const leaderLabel = leaders.slice(0, 2).map((item) => item.label).join(" / ") + (leaders.length > 2 ? ` +${leaders.length - 2}` : "");
    return {
      city: rankedCity.label,
      state: rows[0]?.state ?? "",
      sales: rows.length,
      model: leaderLabel,
      payment: payments[0]?.label ?? "—",
      ticket: rows.length ? rows.reduce((sum, sale) => sum + sale.price, 0) / rows.length : 0,
    };
  }), [cityRanking, filtered]);
  const activeFilters = [model !== "Todos", year !== "Todos", city !== "Todas", payment !== "Todos", Boolean(dateFrom), Boolean(dateTo)].filter(Boolean).length;

  function resetFilters() {
    setModel("Todos"); setYear("Todos"); setCity("Todas"); setPayment("Todos"); setDateFrom(""); setDateTo("");
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand-lockup" aria-label="Porsche Sales Intelligence">
          <span className="brand-word">PORSCHE</span><span className="brand-divider" /><span className="brand-sub">Sales Intelligence</span>
        </div>
        <div className="data-status"><span /> Base comercial consolidada</div>
      </header>

      <section className="hero-shell">
        <div className="eyebrow">Performance comercial · Estados Unidos</div>
        <div className="hero-grid">
          <div>
            <h1>Decisões de venda,<br /><em>com precisão.</em></h1>
            <p>Modelos, cidades e preferências de compra reunidos em uma visão executiva.</p>
          </div>
          <div className="hero-index"><span>Base analisada</span><strong>{number.format(sales.length)}</strong><small>transações registradas</small></div>
        </div>
      </section>

      <section className="dashboard-shell">
        <div className="filter-panel">
          <div className="section-heading filter-title">
            <div><span className="kicker">CONTROLES</span><h2>Refine a análise</h2></div>
            <button className="reset-button" onClick={resetFilters} disabled={!activeFilters}>Limpar filtros {activeFilters ? `(${activeFilters})` : ""}</button>
          </div>
          <div className="filter-grid">
            <label><span>Modelo Porsche</span><select value={model} onChange={(e) => setModel(e.target.value)}><option>Todos</option>{options.models.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Ano-modelo</span><select value={year} onChange={(e) => setYear(e.target.value)}><option>Todos</option>{options.years.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Cidade</span><select value={city} onChange={(e) => setCity(e.target.value)}><option>Todas</option>{options.cities.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Forma de pagamento</span><select value={payment} onChange={(e) => setPayment(e.target.value)}><option>Todos</option>{options.payments.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Período inicial</span><input type="date" value={dateFrom} onInput={(e) => setDateFrom(e.currentTarget.value)} /></label>
            <label><span>Período final</span><input type="date" value={dateTo} onInput={(e) => setDateTo(e.currentTarget.value)} /></label>
          </div>
          <p className="data-note"><span>i</span> Os filtros de período consideram 76 registros com data validada. Sem período selecionado, as 100 vendas permanecem na análise.</p>
        </div>

        <section className="kpi-grid" aria-label="Indicadores principais">
          <article className="kpi-card kpi-dark"><span>Vendas selecionadas</span><strong>{number.format(filtered.length)}</strong><small>{((filtered.length / sales.length) * 100).toFixed(0)}% da base total</small></article>
          <article className="kpi-card"><span>Receita</span><strong>{compactMoney.format(revenue)}</strong><small>{money.format(revenue)} no recorte</small></article>
          <article className="kpi-card"><span>Ticket médio</span><strong>{compactMoney.format(avgTicket)}</strong><small>valor médio por venda</small></article>
          <article className="kpi-card kpi-accent"><span>Ano-modelo líder</span><strong>{topYear?.label ?? "—"}</strong><small>{topYear ? `${topYear.value} vendas no período` : "sem registros"}</small></article>
        </section>

        <section className="analysis-grid">
          <article className="panel panel-wide">
            <div className="section-heading"><div><span className="kicker">DEMANDA</span><h2>Modelos mais vendidos</h2></div><div className="panel-metric"><span>Líder atual</span><strong>{topModel?.label ?? "—"}</strong></div></div>
            {modelRanking.length ? <div className="bar-list">{modelRanking.slice(0, 6).map((item, index) => (
              <div className="bar-row" key={item.label}><span className="rank">{String(index + 1).padStart(2, "0")}</span><span className="bar-label">{item.label}</span><div className="bar-track"><i style={{ width: `${(item.value / maxModelCount) * 100}%` }} /></div><strong>{item.value}</strong></div>
            ))}</div> : <EmptyState />}
          </article>
          <article className="panel city-panel">
            <div className="section-heading"><div><span className="kicker">PRAÇAS</span><h2>Cidades em destaque</h2></div></div>
            {cityRanking.length ? <ol className="city-list">{cityRanking.slice(0, 6).map((item, index) => (
              <li key={item.label}><span className="city-number">{index + 1}</span><div><strong>{item.label}</strong><small>{item.value} {item.value === 1 ? "venda" : "vendas"}</small></div><span className="city-share">{((item.value / filtered.length) * 100).toFixed(0)}%</span></li>
            ))}</ol> : <EmptyState />}
          </article>
        </section>

        <section className="signal-grid" aria-label="Sinais comerciais do recorte">
          <article className="signal-card">
            <span className="signal-index">01</span>
            <div><small>Preferência de modelo</small><strong>{topModel?.label ?? "—"}</strong><p>{topModel ? `${topModel.value} vendas · ${((topModel.value / filtered.length) * 100).toFixed(0)}% do recorte${tiedModelLeaders.length > 1 ? ` · liderança compartilhada com mais ${tiedModelLeaders.length - 1}` : ""}` : "Sem dados no recorte."}</p></div>
          </article>
          <article className="signal-card">
            <span className="signal-index">02</span>
            <div><small>Ano-modelo em evidência</small><strong>{topYear?.label ?? "—"}</strong><p>{topYear ? `${topYear.value} unidades · ${((topYear.value / filtered.length) * 100).toFixed(0)}% das vendas selecionadas` : "Sem dados no recorte."}</p></div>
          </article>
          <article className="signal-card">
            <span className="signal-index">03</span>
            <div><small>Pagamento dominante</small><strong>{topPayment?.label ?? "—"}</strong><p>{topPayment ? `${topPayment.value} transações · ${((topPayment.value / filtered.length) * 100).toFixed(0)}% de participação` : "Sem dados no recorte."}</p></div>
          </article>
        </section>

        <section className="secondary-grid">
          <article className="panel year-panel">
            <div className="section-heading"><div><span className="kicker">PERÍODO</span><h2>Saída por ano-modelo</h2></div><div className="panel-metric"><span>Maior volume</span><strong>{topYear ? `${topYear.label} · ${topYear.value}` : "—"}</strong></div></div>
            {yearRanking.length ? <div className="year-chart">{[...yearRanking].sort((a, b) => Number(a.label) - Number(b.label)).map((item) => (
              <div className={`year-column ${item.label === topYear?.label ? "year-column-active" : ""}`} key={item.label}><div className="year-value">{item.value}</div><div className="year-track"><i style={{ height: `${Math.max((item.value / maxYearCount) * 100, 7)}%` }} /></div><strong>{item.label}</strong></div>
            ))}</div> : <EmptyState />}
          </article>

          <article className="insight-panel">
            <span className="kicker">INSIGHT EXECUTIVO</span>
            <h2>{city !== "Todas" ? `O que se destaca em ${city}?` : "Onde está a concentração de demanda?"}</h2>
            {filtered.length && topModel && topYear ? <>
              <p>{city !== "Todas" ? `A cidade registra ${filtered.length} ${filtered.length === 1 ? "venda" : "vendas"}. ${topModel.label} aparece como principal preferência, enquanto o ano-modelo ${topYear.label} concentra o maior volume no recorte.` : `${topModel.label} ocupa a primeira posição no recorte atual. O ano-modelo ${topYear.label} reúne ${topYear.value} vendas e ${topPayment?.label ?? "a forma líder"} é o pagamento mais recorrente.`}</p>
              <div className="insight-stats"><div><span>Ticket do recorte</span><strong>{money.format(avgTicket)}</strong></div><div><span>Praça líder</span><strong>{cityRanking[0]?.label ?? "—"}</strong></div></div>
            </> : <EmptyState />}
          </article>
        </section>

        <section className="panel table-panel">
          <div className="section-heading"><div><span className="kicker">POPULARIDADE LOCAL</span><h2>Modelos de maior interesse por cidade</h2></div><p className="section-note">Top 10 praças do recorte atual</p></div>
          {cityProfiles.length ? <div className="table-scroll"><table>
            <thead><tr><th>Cidade</th><th>Vendas</th><th>Modelo(s) popular(es)</th><th>Ticket médio</th><th>Pagamento preferido</th></tr></thead>
            <tbody>{cityProfiles.map((profile) => <tr key={profile.city}><td><strong>{profile.city}</strong><span>{profile.state}</span></td><td>{profile.sales}</td><td>{profile.model}</td><td>{money.format(profile.ticket)}</td><td>{profile.payment}</td></tr>)}</tbody>
          </table></div> : <EmptyState />}
        </section>
      </section>
      <footer><span>Sales Intelligence</span><span>Fonte: base fornecida · 100 registros</span></footer>
    </main>
  );
}

function EmptyState() { return <div className="empty-state"><strong>Nenhuma venda encontrada</strong><span>Ajuste os filtros para ampliar o recorte.</span></div>; }
