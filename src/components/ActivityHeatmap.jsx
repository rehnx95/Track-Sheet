import { useEffect, useMemo, useRef } from 'react';
import { buildHeatmap, formatTooltipDate } from '../utils/heatmap';
import './ActivityHeatmap.css';

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function ActivityHeatmap({
  activity,
  todayKey,
  years = [],
  selectedYear = null,
  onSelectYear,
  loading = false,
}) {
  const scrollRef = useRef(null);
  const currentYear = Number(todayKey.slice(0, 4));
  const activeYear = selectedYear == null ? currentYear : selectedYear;

  const heat = useMemo(
    () => buildHeatmap({ activity, todayKey, year: selectedYear }),
    [activity, todayKey, selectedYear],
  );

  const yearList = useMemo(() => {
    const set = new Set([currentYear, ...years]);
    for (const [key, count] of Object.entries(activity || {})) {
      if (count > 0) set.add(Number(key.slice(0, 4)));
    }
    return [...set].filter(Number.isFinite).sort((a, b) => b - a);
  }, [activity, years, currentYear]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = selectedYear == null ? el.scrollWidth : 0;
  }, [heat.columns, selectedYear]);

  const noun = heat.total === 1 ? 'problem' : 'problems';
  const title = `${heat.total.toLocaleString()} ${noun} solved ${
    selectedYear == null ? 'in the last year' : `in ${selectedYear}`
  }`;

  return (
    <section className={`hm-card${loading ? ' hm-loading' : ''}`} aria-label="Activity heatmap">
      <h3 className="hm-title">{title}</h3>
      <div className="hm-body">
        <div className="hm-main">
          <div className="hm-scroll" ref={scrollRef}>
            <div className="hm-inner" style={{ '--hm-weeks': heat.columns }}>
              <div className="hm-months">
                {heat.labels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
              <div className="hm-heat">
                <div className="hm-weekdays">
                  {WEEKDAYS.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
                <div className="hm-weeks">
                  {heat.weeks.map((week, w) => (
                    <div className="hm-week" key={w}>
                      {week.map((day) => {
                        const tip = `${
                          day.count === 0 ? 'No problems' : `${day.count} ${day.count === 1 ? 'problem' : 'problems'}`
                        } on ${formatTooltipDate(day.date, currentYear)}`;
                        return (
                          <span
                            key={day.key}
                            title={day.inRange && !day.future ? tip : undefined}
                            aria-label={day.inRange && !day.future ? tip : undefined}
                            aria-hidden={day.inRange ? undefined : true}
                            className={`hm-day hm-l${day.level}${day.inRange ? '' : ' hm-off'}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="hm-foot">
            <span>Total active days: {heat.activeDays}</span>
            <div className="hm-legend" aria-label="Activity scale: less to more">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <span key={l} className={`hm-swatch hm-l${l}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
        <ul className="hm-years">
          {yearList.map((y) => (
            <li key={y}>
              <button
                type="button"
                               aria-pressed={y === activeYear}
                onClick={() =>
                  onSelectYear?.(
                    y === currentYear && selectedYear === currentYear ? null : y,
                  )
                }
              >
                {y}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}