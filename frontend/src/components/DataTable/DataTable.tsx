import { useState, useMemo } from 'react';
import { DataRow } from '../../hooks/useFetchData';
import './DataTable.css';

interface DataTableProps {
  data: DataRow[];
}

export function DataTable({ data }: DataTableProps) {
  const [filterStagnace, setFilterStagnace] = useState<string>('vše');
  const [filterObchodnik, setFilterObchodnik] = useState<string>('vše');
  const [filterFaze, setFilterFaze] = useState<string>('vše');

  const [filterMesic, setFilterMesic] = useState<string>('vše');

  const obchodnici = useMemo(() => Array.from(new Set(data.map(item => item.person))), [data]);
  const faze = useMemo(() => Array.from(new Set(data.map(item => item.status || 'Neznámý stav'))), [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const d1 = new Date();
      const d2 = new Date(row.lastActivity);
      const activity = Math.floor((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));

      const matchStagnace = filterStagnace === 'vše' || 
        (filterStagnace === 'high' ? activity >= 30 : activity < 30);
      const matchObchodnik = filterObchodnik === 'vše' || row.person === filterObchodnik;
      const matchFaze = filterFaze === 'vše' || row.status === filterFaze;

      const matchMesic = filterMesic === 'vše' || d2.getMonth().toString() === filterMesic;

      return matchStagnace && matchObchodnik && matchFaze && matchMesic;
    });
  }, [data, filterStagnace, filterObchodnik, filterFaze, filterMesic]);

  const mesice = [
    { v: '0', l: 'Leden' }, { v: '1', l: 'Únor' }, { v: '2', l: 'Březen' },
    { v: '3', l: 'Duben' }, { v: '4', l: 'Květen' }, { v: '5', l: 'Červen' },
    { v: '6', l: 'Červenec' }, { v: '7', l: 'Srpen' }, { v: '8', l: 'Září' },
    { v: '9', l: 'Říjen' }, { v: '10', l: 'Listopad' }, { v: '11', l: 'Prosinec' }
  ];

  return (
    <div className="data-table-container">
      <div className="filter-bar">
        <select value={filterStagnace} onChange={(e) => setFilterStagnace(e.target.value)}>
          <option value="vše">Stagnace (vše)</option>
          <option value="high">Kritická (30+ dní)</option>
          <option value="low">V normě</option>
        </select>

        <select value={filterObchodnik} onChange={(e) => setFilterObchodnik(e.target.value)}>
          <option value="vše">Obchodník (všichni)</option>
          {obchodnici.map(name => <option key={name} value={name}>{name}</option>)}
        </select>

        <select value={filterFaze} onChange={(e) => setFilterFaze(e.target.value)}>
          <option value="vše">Fáze (vše)</option>
          {faze.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={filterMesic} onChange={(e) => setFilterMesic(e.target.value)}>
          <option value="vše">Měsíc (vše)</option>
          {mesice.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
      </div>

      <div className="list-header">
        <div className="header-left">
          <input type="checkbox" id="selectAll" />
          <label htmlFor="selectAll">Vybrat vše</label>
        </div>
        <div className="header-right">
          {filteredData.length} příležitostí
        </div>
      </div>

      <div className="list-body">
        {filteredData.length > 0 ? (
          filteredData.map((row, index) => {
            const d1 = new Date();
            const d2 = new Date(row.lastActivity);
            const activity = Math.floor((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
            
            const isHighRisk = activity >= 30;
            const priorityClass = isHighRisk ? 'priority-high' : 'priority-medium';

            return (
              <div key={row.id || index} className={`list-row ${priorityClass}`}>
                <div className="row-checkbox">
                  <input type="checkbox" />
                </div>
                <div className={`inactivity-badge ${isHighRisk ? 'danger' : 'warning'}`}>
                  <span className="icon">🔥</span>
                  <div className="days"><strong>{activity || 0}</strong> dní</div>
                  <div className="text">bez aktivity</div>
                </div>
                <div className="main-info">
                  <div className="title-row">
                    <span className="title">{row.name || 'Název chybí'}</span>
                    <span className="status-badge">{row.status || 'Neznámý stav'}</span>
                  </div>
                  <div className="details-row">
                    <span className="company">🏢 {row.companyName || row.code}</span>
                  </div>
                </div>
                <div className="financial-info">
                  <div className="value">{row.amount ? `${row.amount.toLocaleString('cs-CZ')} Kč` : '0 Kč'}</div>
                  <div className="assignee">
                    <span className="avatar">{row.person ? row.person.split(' ').map(n => n[0]).join('') : 'NN'}</span>
                    <span className="name">{row.person || 'Neznámý uživatel'}</span>
                  </div>
                </div>
                <div className="probability">
                  <div className={`prob-badge ${row.probability && row.probability >= 90 ? 'prob-high' : 'prob-medium'}`}>
                    🎯 {row.probability || 0} %
                  </div>
                </div>
                <div className="actions">
                  <button className="btn btn-primary">✉️ Poslat e-mail</button>
                  <button className="btn btn-outline">📞 Zavolat</button>
                  <button className="btn btn-outline">📅 Naplánovat úkol</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-data">Žádná data k zobrazení</div>
        )}
      </div>
    </div>
  );
}