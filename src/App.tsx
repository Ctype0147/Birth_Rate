import { useMemo, useState } from 'react'
import csvText from './fertility.csv?raw'

const rows = csvText.trim().split(/\r?\n/).map((line) =>
  Array.from(line.matchAll(/(?:^|,)(?:"([^"]*)"|([^,]*))/g), (match) => match[1] ?? match[2]),
)

const ages = rows[1].slice(2).map((label) => label.replace('모의 연령별출산율:', ''))
const data = rows.slice(2).map((row) => ({
  region: row[0],
  total: Number(row[1].replaceAll(',', '')),
  rates: row.slice(2).map((value) => Number(value.replaceAll(',', ''))),
}))
const regions = data.filter((item) => item.region !== '전국')
const nationwide = data.find((item) => item.region === '전국')!
const decimal = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 })

function TrendChart({ values, region }: { values: number[]; region: string }) {
  const max = Math.ceil(Math.max(...values) / 20) * 20
  const x = (index: number) => 68 + index * (620 / (ages.length - 1))
  const y = (value: number) => 226 - (value / max) * 166
  const path = values.map((value, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(value)}`).join(' ')

  return (
    <div className="trend-wrap">
      <svg viewBox="0 0 756 286" role="img" aria-label={`${region} 모의 연령별 출산율 선 그래프`}>
        {[0, 1, 2, 3].map((tick) => {
          const value = max - (max / 3) * tick
          return (
            <g key={tick}>
              <line x1="68" x2="688" y1={60 + tick * 55.3} y2={60 + tick * 55.3} className="grid-line" />
              <text x="54" y={64 + tick * 55.3} textAnchor="end" className="axis-label">{decimal.format(value)}</text>
            </g>
          )
        })}
        <path d={path} className="line" />
        {values.map((value, index) => (
          <g key={ages[index]}>
            <circle cx={x(index)} cy={y(value)} r="5" className="dot" />
            <text x={x(index)} y={y(value) - 14} textAnchor="middle" className="value-label">{decimal.format(value)}</text>
            <text x={x(index)} y="263" textAnchor="middle" className="axis-label">{ages[index]}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function App() {
  const [selected, setSelected] = useState('서울특별시')
  const current = regions.find((item) => item.region === selected)!
  const ranking = useMemo(() => [...regions].sort((a, b) => b.total - a.total), [])
  const maxRank = ranking[0].total
  const selectedRank = ranking.findIndex((item) => item.region === selected) + 1
  const peakIndex = current.rates.indexOf(Math.max(...current.rates))

  return (
    <main>
      <header>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <div className="eyebrow">KOREA FERTILITY DATA</div>
            <div className="title">대한민국 출산율 현황</div>
          </div>
        </div>
        <div className="source">시도별 합계·모의 연령별 출산율</div>
      </header>

      <section className="hero">
        <div>
          <div className="section-kicker">2025 FERTILITY REPORT</div>
          <h1 className="hero-title">출산의 흐름을<br />연령과 지역으로.</h1>
          <p>시도를 선택하면 연령대별 출산율의 흐름과 전국 지역별 합계출산율 순위를 한눈에 확인할 수 있습니다.</p>
        </div>
        <div className="total-card">
          <div className="total-label">전국 합계출산율</div>
          <div className="total-value">{nationwide.total.toFixed(3)}<span>%</span></div>
          <div className="total-meta"><strong>{selected}</strong> {current.total.toFixed(3)}%</div>
          <div className="as-of">2025 기준</div>
        </div>
      </section>

      <section className="dashboard">
        <div className="section-heading">
          <div>
            <div className="section-kicker">AGE PROFILE</div>
            <h2 className="section-title">연령별 출산율 변화</h2>
          </div>
          <label>
            <span>지역 선택</span>
            <select value={selected} onChange={(event) => setSelected(event.target.value)}>
              {regions.map(({ region }) => <option key={region}>{region}</option>)}
            </select>
          </label>
        </div>

        <div className="trend-card">
          <div className="chart-summary">
            <div>
              <span className="summary-label">합계출산율</span>
              <strong>{current.total.toFixed(3)}<small> %</small></strong>
            </div>
            <div className="peak">
              최고 {decimal.format(current.rates[peakIndex])}%
              <span>{ages[peakIndex]}</span>
            </div>
          </div>
          <TrendChart values={current.rates} region={selected} />
        </div>

        <div className="ranking-heading">
          <div>
            <div className="section-kicker">REGIONAL RANKING</div>
            <h2 className="section-title">지역별 합계출산율 순위</h2>
          </div>
          <div className="ranking-date">{selected} · {selectedRank}위</div>
        </div>

        <div className="ranking-card">
          {ranking.map((item, index) => (
            <div className={`rank-row ${item.region === selected ? 'selected' : ''}`} key={item.region}>
              <span className={`rank ${index < 3 ? 'top' : ''}`}>{String(index + 1).padStart(2, '0')}</span>
              <span className="region-name">{item.region}</span>
              <div className="bar-track"><span style={{ width: `${(item.total / maxRank) * 100}%` }} /></div>
              <strong>{item.total.toFixed(3)}%</strong>
            </div>
          ))}
        </div>
      </section>

      <footer>자료: 첨부 CSV · 시도/합계 출산율, 모의 연령별 출산율 (2025)</footer>
    </main>
  )
}

export default App
