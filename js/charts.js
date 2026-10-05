// Interactive SVG Charts for +Cultura Editorial Magazine Theme
// Warm Cultural Palette: Deep Blue, Orange, Sage Green, Amber, Coral

const Charts = {
  palette: [
    '#173B57', // Deep Navy Blue
    '#F28C28', // Terracotta Orange
    '#3E8E75', // Soft Sage Green
    '#F59E0B', // Warm Amber Gold
    '#D9534F', // Warm Coral
    '#4A6572', // Slate Navy
    '#8D6E63'  // Warm Earth
  ],

  // Renders a Donut Chart for Genre Distribution
  renderGenreDonut(containerId, genreData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!genreData || genreData.length === 0) {
      container.innerHTML = `
        <div style="padding: 30px; text-align: center; color: #5F7488;">
          <p>Adicione conteúdos para visualizar a distribuição dos seus gêneros favoritos.</p>
        </div>
      `;
      return;
    }

    const total = genreData.reduce((sum, g) => sum + g.count, 0);
    const size = 240;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedAngle = -90;
    let paths = '';
    let legendHtml = '<div style="display: flex; flex-direction: column; gap: 8px;">';

    genreData.forEach((g, idx) => {
      const color = this.palette[idx % this.palette.length];
      const percentage = Math.round((g.count / total) * 100);
      const strokeDashoffset = circumference - (circumference * (g.count / total));
      const rotation = accumulatedAngle;

      paths += `
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="transparent"
          stroke="${color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          stroke-linecap="round"
          transform="rotate(${rotation} ${center} ${center})"
          style="transition: stroke-width 0.2s ease;"
        >
          <title>${g.name}: ${g.count} (${percentage}%)</title>
        </circle>
      `;

      accumulatedAngle += (g.count / total) * 360;

      legendHtml += `
        <div style="display: flex; align-items: center; gap: 10px; font-size: 13px;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; flex-shrink: 0;"></span>
          <span style="font-weight: 600; color: #173B57;">${g.name}</span>
          <span style="margin-left: auto; color: #5F7488;">${g.count} <small>(${percentage}%)</small></span>
        </div>
      `;
    });

    legendHtml += '</div>';

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; width: 100%; gap: 24px; flex-wrap: wrap;">
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle
              cx="${center}"
              cy="${center}"
              r="${radius}"
              fill="transparent"
              stroke="#EFE7D8"
              stroke-width="${strokeWidth}"
            />
            ${paths}
          </svg>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;">
            <div style="font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 800; color: #173B57; line-height: 1;">${total}</div>
            <div style="font-size: 11px; font-weight: 700; color: #8FA2B5; text-transform: uppercase; letter-spacing: 0.5px;">Itens</div>
          </div>
        </div>
        <div style="flex-grow: 1; min-width: 180px;">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  // Renders a Bar Chart for Rating Distribution (1 to 5 Stars)
  renderRatingsBarChart(containerId, ratingDistribution) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const values = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: ratingDistribution[star] || 0
    }));

    const maxCount = Math.max(...values.map(v => v.count), 1);

    let barsHtml = '<div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">';
    values.forEach(item => {
      const percentage = Math.round((item.count / maxCount) * 100);
      const barColor = item.star >= 4 ? '#F28C28' : item.star === 3 ? '#173B57' : '#D9534F';

      barsHtml += `
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 80px; display: flex; align-items: center; gap: 4px; font-weight: 700; font-size: 13px; color: #173B57;">
            <span style="color: #F59E0B;">★</span>
            <span>${item.star} ${item.star === 1 ? 'estrela' : 'estrelas'}</span>
          </div>
          <div style="flex-grow: 1; height: 10px; background-color: #EFE7D8; border-radius: 5px; overflow: hidden;">
            <div style="height: 100%; width: ${percentage}%; background-color: ${barColor}; border-radius: 5px; transition: width 0.5s ease;"></div>
          </div>
          <div style="width: 32px; text-align: right; font-weight: 700; font-size: 13px; color: #173B57;">${item.count}</div>
        </div>
      `;
    });
    barsHtml += '</div>';

    container.innerHTML = barsHtml;
  }
};
