import { showNotification } from "./utils.js";

export function firstSection(
  login,
  firstName,
  lastName,
  profileImage
) {
  const root = document.getElementById("profile-root");
  if (!root) return;

  root.innerHTML = `
     <section class="profile-page-container" style="position: relative;">
    <button 
      id="logoutBtn" 
      style="position: absolute; top: 20px; right: 20px; padding: 8px 16px; background-color: #7b1fa2; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Log Out
    </button>

    <article class="profile-card fade-in">
      <div class="profile-avatar pulse">
        <img
          src="${profileImage}"
          alt="${firstName}'s profile picture"
          class="avatar-img"
          onerror="this.src='https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=7b1fa2&color=fff&size=150'"
        >
      </div>

      <h1>
        Welcome&nbsp;<span class="accent-text">${firstName}</span>
      </h1>
      <div class="profile-grid">
        <div class="profile-row"><strong>Login:</strong><span>${login}</span></div>
        <div class="profile-row"><strong>First Name:</strong><span>${firstName}</span></div>
        <div class="profile-row"><strong>Last Name:</strong><span>${lastName}</span></div>
      </div>
    </article>
  </section>
`;
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("jwt");
    showNotification("logged out");
    location.reload();
  });
}

export function secondSection(email, xp, campus, region) {
  const root = document.getElementById("profile-extras");
  if (!root) return;

  root.innerHTML = `

  <section class="profile-page-container" style="position: relative;">
  <article class="profile-card fade-in">
   <h1>
        Personal Info :
      </h1>
      <div class="profile-grid">
        <div class="profile-row"><strong>Email:</strong><span>${email}</span></div>
        <div class="profile-row"><strong>Campus:</strong><span>${campus}</span></div>
        <div class="profile-row"><strong>XP:</strong><span class="xp-value">${xp}</span></div>
        <div class="profile-row"><strong>Region:</strong><span>${region}</span></div>
      </div>
    </article>
  </section>
`;
}

export function renderAuditData(total, success, fail, winrate, loserate) {
  const root = document.getElementById("audit-root");
  if (!root) return;

  root.innerHTML = `
    <div class="stats-container">
      <div class="stats-card">
        <h2>Audit Statistics</h2>
        <div class="win-rate-display">${winrate} Success Rate</div>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div class="win-progress" style="width: ${winrate}"></div>
            <div class="lose-progress" style="width: ${loserate}"></div>
          </div>
          <div class="progress-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${total}</div>
            <div class="stat-label">Total Audits</div>
          </div>
          <div class="stat-item success">
            <div class="stat-value">${success}</div>
            <div class="stat-label">Success</div>
          </div>
          <div class="stat-item fail">
            <div class="stat-value">${fail}</div>
            <div class="stat-label">Failed</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderSkillData(skills) {
  const root = document.getElementById("skill-root");
  if (!root) return;

  // Deduplicate by keeping the highest amount for each type
  const map = new Map();
  for (const skill of skills) {
    if (!map.has(skill.type) || map.get(skill.type).amount < skill.amount) {
      map.set(skill.type, skill);
    }
  }

  const cleanedSkills = Array.from(map.values());
  const maxAmount = Math.max(...cleanedSkills.map((s) => s.amount));

  // Enhanced responsive sizing calculations
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  // Dynamic bar sizing based on screen size and number of skills
  const baseBarWidth = isMobile ? 40 : isTablet ? 60 : 80;
  const barWidth = Math.max(
    baseBarWidth,
    Math.min(120, (window.innerWidth - 100) / cleanedSkills.length - 20)
  );
  const barSpacing = isMobile ? 15 : isTablet ? 25 : 35;

  // Chart dimensions with better mobile optimization
  const baseChartHeight = isMobile ? 300 : isTablet ? 400 : 500;
  const chartHeight = Math.min(baseChartHeight, window.innerHeight * 0.4);

  // Calculate total width with padding
  const totalBarsWidth =
    cleanedSkills.length * (barWidth + barSpacing) - barSpacing;
  const chartPadding = 40;
  const chartWidth = Math.max(totalBarsWidth + chartPadding * 2, 300);

  // Dynamic font sizes based on bar width and screen size
  const amountFontSize = Math.max(12, Math.min(18, barWidth * 0.25));
  const labelFontSize = Math.max(10, Math.min(16, barWidth * 0.2));

  // Enhanced text positioning to prevent overflow
  const textPadding = 10;
  const labelOffset = 25;

  const svgBars = cleanedSkills
    .map((skill, i) => {
      const height = Math.max(
        10,
        (skill.amount / maxAmount) * (chartHeight - 60)
      ); // Reserve space for labels
      const x = chartPadding + i * (barWidth + barSpacing);
      const y = chartHeight - height - labelOffset;

      // Ensure text doesn't overflow
      const amountY = Math.max(amountFontSize + 5, y - textPadding);
      const labelY = chartHeight - 5;

      return `
      <g class="skill-group">
        <!-- Bar with enhanced shadow and gradient -->
        <rect 
          x="${x}" 
          y="${y}" 
          width="${barWidth}" 
          height="${height}" 
          rx="6" 
          fill="url(#barGradient)" 
          class="skill-bar"
          filter="url(#barShadow)"
        />

        <!-- Amount Label Above Bar (Fixed positioning) -->
        <text 
          x="${x + barWidth / 2}" 
          y="${amountY}" 
          text-anchor="middle" 
          font-size="${amountFontSize}" 
          fill="var(--text-primary)"
          font-weight="600"
          class="skill-amount"
          dominant-baseline="middle"
        >
          ${skill.amount}
        </text>

        <!-- Skill Label Below Chart (Fixed positioning) -->
        <text 
          x="${x + barWidth / 2}" 
          y="${labelY}" 
          text-anchor="middle" 
          font-size="${labelFontSize}" 
          fill="var(--text-primary)"
          class="skill-label"
          dominant-baseline="middle"
        >
          ${skill.type.replace("skill_", "").toUpperCase()}
        </text>
      </g>
    `;
    })
    .join("");

  // Enhanced SVG with better viewBox and responsive design
  const svgHeight = chartHeight + 40; // Extra space for labels
  const viewBoxWidth = chartWidth;
  const viewBoxHeight = svgHeight;

  root.innerHTML = `
    <div class="stats-container">
      <div class="stats-card">
        <h2>Skill Statistics</h2>
        <div class="chart-container">
          <svg
            viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
            width="100%"
            height="${Math.min(svgHeight, window.innerHeight * 0.6)}"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            font-family="Segoe UI, Tahoma, sans-serif"
            class="skill-chart"
            style="max-width: 100%; height: auto;"
          >
            <defs>
              <!-- Enhanced gradient -->
              <linearGradient id="barGradient" x1="0" x2="0" y1="1" y2="0">
                <stop offset="0%" stop-color="var(--accent-primary)" />
                <stop offset="50%" stop-color="var(--accent-secondary)" />
                <stop offset="100%" stop-color="#e1bee7" />
              </linearGradient>
              
              <!-- Enhanced shadow filter -->
              <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feOffset dx="2" dy="2" result="offsetBlur" />
                <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
              </filter>
              
              <!-- Glow effect for hover -->
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <!-- Background grid for better readability -->
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
            
            ${svgBars}
          </svg>
        </div>
      </div>
    </div>
  `;

  // Add enhanced interactivity
  const skillGroups = root.querySelectorAll(".skill-group");
  skillGroups.forEach((group, index) => {
    const rect = group.querySelector(".skill-bar");
    const amount = group.querySelector(".skill-amount");
    const label = group.querySelector(".skill-label");

    group.addEventListener("mouseenter", () => {
      rect.setAttribute("filter", "url(#glow)");
      amount.setAttribute("fill", "var(--accent-secondary)");
      label.setAttribute("fill", "var(--accent-secondary)");
    });

    group.addEventListener("mouseleave", () => {
      rect.setAttribute("filter", "url(#barShadow)");
      amount.setAttribute("fill", "var(--text-primary)");
      label.setAttribute("fill", "var(--text-primary)");
    });
  });

  // Add resize listener for better responsiveness
  const resizeHandler = () => {
    // Debounce resize events
    clearTimeout(window.skillChartResizeTimeout);
    window.skillChartResizeTimeout = setTimeout(() => {
      renderSkillData(skills);
    }, 250);
  };

  window.addEventListener("resize", resizeHandler);

  // Clean up listener when component unmounts
  return () => {
    window.removeEventListener("resize", resizeHandler);
    clearTimeout(window.skillChartResizeTimeout);
  };
}
