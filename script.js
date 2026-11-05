/**
 * LILIAN ALEXANDER - DATA ANALYTICS PORTFOLIO JAVASCRIPT
 * Handles interactive project carousel, case study modals,
 * theme switching, live Chart.js dashboard, form validation, and clipboard copying.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initScrollSpy();
  initProjectCarousel();
  initProjectModals();
  initLiveInteractiveDashboard();
  initContactForm();
  initClipboardCopy();
  initCurrentYear();
});

/* ==========================================================================
   1. THEME SWITCHER (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  const icon = themeToggleBtn.querySelector('i');

  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
  });

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      icon.className = 'fa-solid fa-sun';
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      icon.className = 'fa-solid fa-moon';
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }

    if (window.liveCharts) {
      updateChartsTheme(theme);
    }
  }
}

/* ==========================================================================
   2. MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isOpen = navMenu.classList.contains('open');
    menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  });
}

/* ==========================================================================
   3. SCROLL SPY & NAVBAR BLUR
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   4. INTERACTIVE PROJECT CAROUSEL
   ========================================================================== */
function initProjectCarousel() {
  const track = document.getElementById('carousel-track');
  const wrapper = document.getElementById('carousel-wrapper');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const autoplayToggleBtn = document.getElementById('carousel-autoplay-toggle');
  const currentSlideNumEl = document.getElementById('current-slide-num');
  const totalSlideNumEl = document.getElementById('total-slide-num');
  const dotButtons = Array.from(document.querySelectorAll('.dot-btn'));
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayInterval = null;
  let isAutoplayRunning = true;
  let visibleSlides = [...slides];

  totalSlideNumEl.innerText = String(slides.length).padStart(2, '0');

  function updateCarousel(animate = true) {
    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    // Move track
    const offset = currentIndex * 100;
    track.style.transform = `translateX(-${offset}%)`;

    // Update active slide class
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update counter
    currentSlideNumEl.innerText = String(currentIndex + 1).padStart(2, '0');

    // Update dots
    dotButtons.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = slides.length - 1;
    } else if (index >= slides.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateCarousel(true);
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Navigation Button Clicks
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  // Dot Clicks
  dotButtons.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      resetAutoplay();
    });
  });

  // Filter Integration
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      if (filterVal === 'all') {
        // Find first slide
        goToSlide(0);
      } else {
        // Find first matching slide
        const matchingIndex = slides.findIndex(slide => {
          const cat = slide.getAttribute('data-category') || '';
          return cat.includes(filterVal);
        });

        if (matchingIndex !== -1) {
          goToSlide(matchingIndex);
        }
      }
      resetAutoplay();
    });
  });

  // Autoplay Logic
  function startAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      nextSlide();
    }, 6000);
    isAutoplayRunning = true;
    if (autoplayToggleBtn) {
      autoplayToggleBtn.classList.remove('paused');
      autoplayToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      autoplayToggleBtn.setAttribute('title', 'Pause Auto-advance');
    }
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
    isAutoplayRunning = false;
    if (autoplayToggleBtn) {
      autoplayToggleBtn.classList.add('paused');
      autoplayToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      autoplayToggleBtn.setAttribute('title', 'Resume Auto-advance');
    }
  }

  function resetAutoplay() {
    if (isAutoplayRunning) {
      startAutoplay();
    }
  }

  if (autoplayToggleBtn) {
    autoplayToggleBtn.addEventListener('click', () => {
      if (isAutoplayRunning) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  // Pause on hover
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => {
      if (autoplayInterval && isAutoplayRunning) {
        clearInterval(autoplayInterval);
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      if (isAutoplayRunning) {
        startAutoplay();
      }
    });
  }

  // Touch Swipe Support for Mobile & Tablets
  let touchStartX = 0;
  let touchEndX = 0;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 45;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped left -> next
      nextSlide();
      resetAutoplay();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped right -> prev
      prevSlide();
      resetAutoplay();
    }
  }

  // Keyboard navigation when carousel section is in view
  document.addEventListener('keydown', (e) => {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;
    const rect = projectsSection.getBoundingClientRect();
    const inView = (rect.top <= window.innerHeight && rect.bottom >= 0);

    if (inView) {
      if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
      }
    }
  });

  // Start initial autoplay
  startAutoplay();
  updateCarousel(false);
}

/* ==========================================================================
   5. PROJECT CASE STUDY DATA & MODAL SYSTEM (Curated for Early-Career Analyst)
   ========================================================================== */
const projectCaseStudies = {
  'project-healthconnect': {
    title: 'HealthConnect: Patient Flow & Clinical Appointment Analytics',
    category: 'Healthcare Analytics • Power BI & SQL',
    problem: 'Conducted an analytical investigation into patient appointment attendance, wait-time bottlenecks, and clinic resource utilization to uncover patterns contributing to missed appointments and clinic downtime.',
    methodology: [
      'Cleaned, normalized, and transformed electronic patient and appointment logs across clinical departments using SQL and Power Query.',
      'Constructed a relational data model linking Patient Demographics, Visit Records, and Department Categories.',
      'Calculated core healthcare metrics: Appointment Completion Rate, Dwell Times, and Department Attendance Rates.',
      'Designed an interactive Power BI dashboard featuring workload comparisons, demographic drill-downs, and no-show trend tracking.'
    ],
    sqlSnippet: `-- Clinical Appointment Dwell & Completion Tracking
SELECT 
  department_name,
  appointment_status,
  COUNT(appointment_id) AS total_visits,
  ROUND(AVG(TIMESTAMPDIFF(MINUTE, scheduled_time, consultation_start_time)), 1) AS avg_wait_mins,
  ROUND(100.0 * SUM(CASE WHEN appointment_status = 'No-Show' THEN 1 ELSE 0 END) / COUNT(*), 1) AS no_show_rate
FROM clinical_appointments
GROUP BY department_name, appointment_status
ORDER BY no_show_rate DESC;`,
    insights: [
      'Discovered that Monday morning slots incurred a 34% no-show rate; demonstrated that automated 24-hr reminders could mitigate missed appointments by 28%.',
      'Identified an average 45-minute wait-time lag during night shift rotations, highlighting potential staffing bottlenecks.',
      'Created clear visual charts that improved visibility into clinic bed turnover and appointment volumes.'
    ],
    tools: ['Power BI Desktop', 'SQL Queries', 'Data Cleaning', 'Power Query (M)', 'Excel', 'Healthcare Metrics'],
    githubUrl: 'https://github.com/LilyyAnalyst6/HEALTHCONNECT-FINAL-PROJECT.git'
  },

  'project-superstore': {
    title: 'Superstore Sales Performance & Profitability Analysis',
    category: 'Commercial Analysis • Power BI & DAX Modeling',
    problem: 'Analyzed a multi-regional retail sales dataset to investigate how sales volume, discounting strategies, and product categories impact overall net profitability.',
    methodology: [
      'Built a 5-page Power BI report covering Sales Overview, Regional Trends, Customer Segments, Product Profitability, and Discounting Effects.',
      'Formulated DAX measures for Profit Margin %, Total Sales, Profit-to-Sales Ratios, and Discount Elasticity.',
      'Created dynamic visual filters and slicers allowing users to inspect product categories and regional performance in detail.'
    ],
    sqlSnippet: `// DAX Measure: Net Profit Contribution After Promotional Discounting
Net_Profit_Margin = 
VAR TotalSales = SUM(Superstore[Sales])
VAR TotalProfit = SUM(Superstore[Profit])
VAR TotalDiscount = SUM(Superstore[Discount_Amount])
RETURN
DIVIDE(TotalProfit - TotalDiscount, TotalSales, 0)`,
    insights: [
      'Discovered that discounts greater than 20% in Furniture resulted in negative profit margins despite generating high sales volume.',
      'Identified that 22% of customer accounts contributed to 80% of total profit, emphasizing the value of key account relationships.',
      'Demonstrated through simulation how moderating discount thresholds could preserve profitability without hurting topline sales.'
    ],
    tools: ['Power BI Desktop', 'DAX Measures', 'Power Query (M)', 'Financial Modeling', 'Data Visualization', 'Excel'],
    githubUrl: 'https://github.com/LilyyAnalyst6/Super-Store-Sales-Dashboard.git'
  },

  'project-realestate': {
    title: 'California Real Estate Market Trends & Housing Analysis',
    category: 'Geospatial Analytics • Power BI & Census Exploration',
    problem: 'Explored geographic price variations, affordability relationships, and demographic variables across 20,640 California census block groups.',
    methodology: [
      'Cleaned, normalized, and validated 20,640 census records in Power Query, handling missing data and outliers.',
      'Built geospatial map visuals and scatter plots to analyze the relationship between median income, housing age, and property valuation.',
      'Constructed an Affordability Index metric to compare household income levels against localized property prices.'
    ],
    sqlSnippet: `// DAX Measure: Housing Affordability Multiplier
Affordability_Index = 
DIVIDE(
  AVERAGE(CaliforniaHousing[median_house_value]),
  AVERAGE(CaliforniaHousing[median_income]) * 10000,
  0
)`,
    insights: [
      'Confirmed that coastal proximity was the single largest predictor of property valuation independent of house age.',
      'Identified inland regional clusters offering significantly more accessible price-to-income ratios below 3.8x.',
      'Produced intuitive visual reports enabling users to explore housing price distributions across counties.'
    ],
    tools: ['Power BI Desktop', 'Geospatial Visuals', 'Power Query (M)', 'DAX Calculations', 'Census Data', 'Excel'],
    githubUrl: 'https://github.com/LilyyAnalyst6/CodeAlpha--Real-Estate-Market-Trends.git'
  },

  'project-education': {
    title: 'Educational Performance & Academic Resource Allocation',
    category: 'Educational Research • Power BI & Exploratory Data Analysis',
    problem: 'Investigated whether learning resources, study hours, and academic support correlate with student exam outcomes across 12,469 cleaned student records.',
    methodology: [
      'Cleaned and prepared 12,469 student records in Power Query, imputing missing entries and verifying score ranges.',
      'Conducted exploratory data analysis (EDA) to assess score distributions across mathematics, reading, and science.',
      'Developed a 2-page Power BI dashboard visualizing score percentiles, study hour tiers, and resource availability.'
    ],
    sqlSnippet: `// DAX Measure: High Study Hours Score Lift
Score_Lift_HighStudy = 
CALCULATE(
  AVERAGE(StudentPerformance[Exam_Score]),
  StudentPerformance[Weekly_Study_Hours] >= 15
) - 
CALCULATE(
  AVERAGE(StudentPerformance[Exam_Score]),
  StudentPerformance[Weekly_Study_Hours] < 15
)`,
    insights: [
      'Found that students with 15+ weekly study hours and digital learning access had a +24 percentile point increase in STEM exam scores.',
      'Extracurricular participation was strongly associated with lower course failure rates among at-risk students.',
      'Synthesized findings into clear visual summaries to support data-informed resource distribution discussions.'
    ],
    tools: ['Power BI Desktop', 'Power Query (M)', 'DAX Measures', 'Statistical EDA', 'Exploratory Analysis', 'Excel'],
    githubUrl: 'https://github.com/LilyyAnalyst6/CodeAlpha--Educational-Performance-and-Resource-Allocation.git'
  },

  'project-hr': {
    title: 'HR Workforce Analytics: Turnover, Recruitment & Performance',
    category: 'HR Analytics • Power BI & DAX Exploration',
    problem: 'Analyzed an HR dataset of 311 employees to examine turnover patterns, recruitment channel effectiveness, and performance review distributions.',
    methodology: [
      'Cleaned and modeled HR personnel records in Power Query, standardizing department names and employment statuses.',
      'Formulated DAX workforce metrics: Attrition Rate, Average Department Tenure, and Channel Retention Rates.',
      'Created a 2-page Power BI dashboard with interactive department filters and tenure distribution charts.'
    ],
    sqlSnippet: `// DAX Measure: Voluntary Turnover Rate
Voluntary_Attrition_Rate = 
VAR Exits = CALCULATE(COUNT(HRData[Employee_ID]), HRData[Employment_Status] = "Terminated for Cause" || HRData[Employment_Status] = "Voluntarily Terminated")
VAR TotalStaff = COUNT(HRData[Employee_ID])
RETURN
DIVIDE(Exits, TotalStaff, 0)`,
    insights: [
      'Identified that voluntary departures clustered around the 18–24 month mark, providing actionable insight for retention strategies.',
      'Discovered that employee referral hires had significantly higher 2-year retention rates compared to external commercial job boards.',
      'Delivered clean visual storytelling that highlighted key workforce trends clearly and concisely.'
    ],
    tools: ['Power BI Desktop', 'HR Metrics', 'DAX Measures', 'Exploratory Analysis', 'Power Query', 'Excel'],
    githubUrl: 'https://github.com/LilyyAnalyst6/CodeAlpha--Human-Resources-Analytics.git'
  }
};

function initProjectModals() {
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const closeBtn = document.getElementById('modal-close-btn');
  const openButtons = document.querySelectorAll('.open-modal-btn');

  if (!modal || !modalContent) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projectId = btn.getAttribute('data-project');
      const data = projectCaseStudies[projectId];
      if (!data) return;

      modalContent.innerHTML = `
        <div class="modal-header-section">
          <div class="modal-meta">
            <span class="badge badge-powerbi">${data.category}</span>
          </div>
          <h2 class="modal-title">${data.title}</h2>
        </div>

        <div class="modal-body-section">
          <div class="modal-block">
            <h4><i class="fa-solid fa-triangle-exclamation"></i> The Business Challenge</h4>
            <p>${data.problem}</p>
          </div>

          <div class="modal-block">
            <h4><i class="fa-solid fa-diagram-project"></i> Methodology & Technical Workflow</h4>
            <ul>
              ${data.methodology.map(m => `<li><i class="fa-solid fa-check"></i> ${m}</li>`).join('')}
            </ul>
          </div>

          <div class="modal-block">
            <h4><i class="fa-solid fa-code"></i> Technical Query / Analytical Logic Sample</h4>
            <pre class="modal-code-sample"><code>${escapeHtml(data.sqlSnippet)}</code></pre>
          </div>

          <div class="modal-block">
            <h4><i class="fa-solid fa-chart-line"></i> Key Business Insights & Impact</h4>
            <ul>
              ${data.insights.map(i => `<li><i class="fa-solid fa-arrow-trend-up"></i> ${i}</li>`).join('')}
            </ul>
          </div>

          <div class="modal-block">
            <h4><i class="fa-solid fa-screwdriver-wrench"></i> Core Technologies Employed</h4>
            <div class="project-tools-list">
              ${data.tools.map(t => `<span>${t}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer-actions">
          <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            <i class="fa-brands fa-github"></i>
            <span>View Full Project on GitHub</span>
          </a>
          <a href="#contact" class="btn btn-outline btn-sm modal-contact-link">
            <i class="fa-solid fa-envelope"></i>
            <span>Discuss this Project</span>
          </a>
        </div>
      `;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const modalContactLink = modalContent.querySelector('.modal-contact-link');
      if (modalContactLink) {
        modalContactLink.addEventListener('click', () => {
          closeModal();
        });
      }
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }
}

/* ==========================================================================
   6. LIVE INTERACTIVE DASHBOARD (Chart.js Powered)
   ========================================================================== */
function initLiveInteractiveDashboard() {
  const trendCanvas = document.getElementById('liveTrendChart');
  const breakdownCanvas = document.getElementById('liveBreakdownChart');
  if (!trendCanvas || !breakdownCanvas) return;

  const domainButtons = document.querySelectorAll('#metric-domain-controls .t-btn');
  const timeButtons = document.querySelectorAll('#time-window-controls .t-btn');

  const dashboardData = {
    revenue: {
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        actual: [280, 310, 340, 320, 390, 410, 430, 420, 460, 482, 510, 540],
        target: [270, 290, 310, 330, 360, 380, 400, 420, 440, 460, 480, 500],
        kpis: {
          val1: '$482,900', label1: 'Total Gross Revenue', badge1: '+14.2%', trend1: 'positive', note1: 'vs Previous Period ($422,800)',
          val2: '6,420', label2: 'Active Customers', badge2: '+8.6%', trend2: 'positive', note2: 'Net new additions: +512',
          val3: '$124.50', label3: 'Average Order Value', badge3: '+5.1%', trend3: 'positive', note3: 'Basket conversion rate: 3.4%',
          val4: '$34.20', label4: 'Customer Acquisition Cost', badge4: '-11.4%', trend4: 'negative-good', note4: 'LTV / CAC Ratio: 3.6x (Healthy)'
        },
        breakdownLabels: ['Enterprise B2B', 'Direct Online', 'Retail Partners', 'Marketplaces'],
        breakdownValues: [42, 28, 18, 12],
        story: 'Current trend highlights a strong Q3 acceleration driven primarily by Enterprise segment expansion (+22% YoY). B2B self-service pipelines reduced onboarding latency from 14 to 6 days.'
      },
      quarterly: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4 (Proj)'],
        actual: [930, 1120, 1312, 1532],
        target: [870, 1070, 1260, 1440],
        kpis: {
          val1: '$4,894,000', label1: 'Cumulative 2026 Rev', badge1: '+17.8%', trend1: 'positive', note1: 'Pacing 108% against budget',
          val2: '18,940', label2: 'Annual Active Buyers', badge2: '+14.2%', trend2: 'positive', note2: 'Retention Rate: 84.6%',
          val3: '$138.20', label3: 'Blended Basket Size', badge3: '+7.4%', trend3: 'positive', note3: 'Tier 1 volume incentives active',
          val4: '$31.80', label4: 'Blended Acquisition Cost', badge4: '-14.0%', trend4: 'negative-good', note4: 'Organic referrals up 28%'
        },
        breakdownLabels: ['Enterprise B2B', 'Direct Online', 'Retail Partners', 'Marketplaces'],
        breakdownValues: [46, 25, 17, 12],
        story: 'Quarterly review reveals consecutive beat on gross targets. Strategic shift toward multi-year enterprise contracts increased predictable recurring revenue by 34%.'
      }
    },
    retention: {
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        actual: [6.8, 6.5, 6.2, 5.9, 5.4, 4.9, 4.6, 4.2, 4.0, 3.8, 3.6, 3.4],
        target: [5.0, 5.0, 4.8, 4.8, 4.5, 4.5, 4.2, 4.2, 4.0, 4.0, 3.8, 3.8],
        kpis: {
          val1: '3.8%', label1: 'Monthly Churn Rate', badge1: '-44% YoY', trend1: 'negative-good', note1: 'Down from 6.8% in January',
          val2: '89.4%', label2: 'Net Revenue Retention (NRR)', badge2: '+11.2%', trend2: 'positive', note2: 'Target benchmark: 85%',
          val3: '4.8 Days', label3: 'Avg Time to 1st Value', badge3: '-52%', trend3: 'negative-good', note3: 'Guided onboarding workflow',
          val4: '$1,840', label4: 'Customer Lifetime Value', badge4: '+26.4%', trend4: 'positive', note4: 'Expansion tiers driving uplift'
        },
        breakdownLabels: ['Product Fit / Needs', 'Pricing / Budget', 'Switched Competitor', 'Lack of Support'],
        breakdownValues: [36, 28, 22, 14],
        story: 'Proactive intervention workflows reduced churn from 6.8% down to 3.8%. Clinical survey analysis showed competitor migration halved after the Q2 feature release.'
      },
      quarterly: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4 (Proj)'],
        actual: [6.5, 5.4, 4.2, 3.5],
        target: [5.0, 4.7, 4.2, 3.8],
        kpis: {
          val1: '4.7%', label1: 'Avg Churn (Trailing 12M)', badge1: '-2.1 pts', trend1: 'negative-good', note1: 'Sustained downward slope',
          val2: '92.1%', label2: 'Annual Retention Score', badge2: '+8.4%', trend2: 'positive', note2: 'Top quartile industry benchmark',
          val3: '5.2 Days', label3: 'Onboarding Velocity', badge3: '-46%', trend3: 'negative-good', note3: 'Automated notification tickets active',
          val4: '$2,150', label4: 'Projected 3-Yr LTV', badge4: '+31.2%', trend4: 'positive', note4: 'Based on cohort survival models'
        },
        breakdownLabels: ['Product Fit / Needs', 'Pricing / Budget', 'Switched Competitor', 'Lack of Support'],
        breakdownValues: [32, 30, 24, 14],
        story: 'Cohorts onboarded post-April show an 18-month survival probability of 78%, outperforming baseline cohorts by 19 percentage points.'
      }
    },
    efficiency: {
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        actual: [142, 138, 126, 118, 110, 98, 92, 85, 78, 72, 68, 64],
        target: [130, 120, 115, 105, 100, 95, 88, 82, 75, 70, 68, 65],
        kpis: {
          val1: '72 Mins', label1: 'Order Fulfillment Cycle', badge1: '-49.2%', trend1: 'negative-good', note1: 'Target SLA: < 90 mins',
          val2: '99.1%', label2: 'Inventory Record Accuracy', badge2: '+4.3%', trend2: 'positive', note2: 'Verified across retail SKUs',
          val3: '$4.12', label3: 'Logistics Cost / Unit', badge3: '-23.8%', trend3: 'negative-good', note3: 'Optimized routing models',
          val4: '98.6%', label4: 'On-Time In-Full (OTIF)', badge4: '+6.1%', trend4: 'positive', note4: 'Supplier reliability index'
        },
        breakdownLabels: ['Direct Facility A', 'Regional Hub B', 'Cross-Dock Hub C', 'Partner Network'],
        breakdownValues: [48, 24, 18, 10],
        story: 'Automated warehouse safety stock and reorder algorithms cut manual cycle times in half while increasing inventory accuracy above 99%.'
      },
      quarterly: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4 (Proj)'],
        actual: [135, 108, 85, 66],
        target: [121, 100, 81, 67],
        kpis: {
          val1: '98.5 Mins', label1: 'Avg Lead-Time SLA', badge1: '-38%', trend1: 'negative-good', note1: 'Consistent operational efficiency',
          val2: '99.3%', label2: 'Process Accuracy', badge2: '+5.1%', trend2: 'positive', note2: 'Automated verification pipelines',
          val3: '$4.38', label3: 'Blended Cost / Order', badge3: '-19.4%', trend3: 'negative-good', note3: 'Carrier consolidation savings',
          val4: '98.9%', label4: 'OTIF Fulfillment', badge4: '+7.2%', trend4: 'positive', note4: 'Reduced customer delivery claims'
        },
        breakdownLabels: ['Direct Facility A', 'Regional Hub B', 'Cross-Dock Hub C', 'Partner Network'],
        breakdownValues: [50, 22, 18, 10],
        story: 'Cross-functional optimization across regional facilities achieved a combined \$320K operational holding cost savings.'
      }
    }
  };

  let activeDomain = 'revenue';
  let activeTime = 'monthly';
  let trendChart;
  let breakdownChart;

  function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      textColor: isLight ? '#475569' : '#94a3b8',
      gridColor: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)',
      cardBg: isLight ? '#ffffff' : '#131c2e'
    };
  }

  function renderCharts() {
    const dataObj = dashboardData[activeDomain][activeTime];
    const colors = getThemeColors();

    const trendCtx = trendCanvas.getContext('2d');
    if (trendChart) trendChart.destroy();

    const gradient = trendCtx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: dataObj.labels,
        datasets: [
          {
            label: 'Actual Metric',
            data: dataObj.actual,
            borderColor: '#06b6d4',
            backgroundColor: gradient,
            borderWidth: 3,
            pointBackgroundColor: '#06b6d4',
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.35
          },
          {
            label: 'Target Benchmark',
            data: dataObj.target,
            borderColor: 'rgba(139, 92, 246, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: colors.textColor,
              font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: colors.cardBg,
            titleColor: '#06b6d4',
            bodyColor: colors.textColor,
            borderColor: 'rgba(6, 182, 212, 0.3)',
            borderWidth: 1,
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans' } }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans' } }
          }
        }
      }
    });

    const breakdownCtx = breakdownCanvas.getContext('2d');
    if (breakdownChart) breakdownChart.destroy();

    breakdownChart = new Chart(breakdownCtx, {
      type: 'doughnut',
      data: {
        labels: dataObj.breakdownLabels,
        datasets: [{
          data: dataObj.breakdownValues,
          backgroundColor: [
            '#06b6d4',
            '#8b5cf6',
            '#10b981',
            '#f59e0b'
          ],
          borderWidth: 2,
          borderColor: colors.cardBg
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: colors.textColor,
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' },
              boxWidth: 12,
              padding: 12
            }
          },
          tooltip: {
            backgroundColor: colors.cardBg,
            bodyColor: colors.textColor,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw}%`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });

    updateKpiCards(dataObj.kpis);
    updateStoryText(dataObj.story);

    window.liveCharts = { trendChart, breakdownChart, renderCharts };
  }

  function updateKpiCards(k) {
    document.getElementById('kpi-val-1').innerText = k.val1;
    document.getElementById('kpi-label-1').innerText = k.label1;
    document.getElementById('kpi-badge-1').innerHTML = `<i class="fa-solid fa-arrow-trend-${k.trend1.includes('positive') ? 'up' : 'down'}"></i> ${k.badge1}`;
    document.getElementById('kpi-badge-1').className = `kpi-trend ${k.trend1}`;
    document.getElementById('kpi-note-1').innerText = k.note1;

    document.getElementById('kpi-val-2').innerText = k.val2;
    document.getElementById('kpi-label-2').innerText = k.label2;
    document.getElementById('kpi-badge-2').innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${k.badge2}`;
    document.getElementById('kpi-note-2').innerText = k.note2;

    document.getElementById('kpi-val-3').innerText = k.val3;
    document.getElementById('kpi-label-3').innerText = k.label3;
    document.getElementById('kpi-badge-3').innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${k.badge3}`;
    document.getElementById('kpi-note-3').innerText = k.note3;

    document.getElementById('kpi-val-4').innerText = k.val4;
    document.getElementById('kpi-label-4').innerText = k.label4;
    document.getElementById('kpi-badge-4').innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${k.badge4}`;
    document.getElementById('kpi-badge-4').className = `kpi-trend ${k.trend4}`;
    document.getElementById('kpi-note-4').innerText = k.note4;
  }

  function updateStoryText(story) {
    const el = document.getElementById('demo-story-text');
    if (el) el.innerText = story;
  }

  domainButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      domainButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDomain = btn.getAttribute('data-domain');
      renderCharts();
    });
  });

  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      timeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTime = btn.getAttribute('data-time');
      renderCharts();
    });
  });

  renderCharts();
}

function updateChartsTheme(theme) {
  if (window.liveCharts && typeof window.liveCharts.renderCharts === 'function') {
    window.liveCharts.renderCharts();
  }
}

/* ==========================================================================
   7. CONTACT FORM VALIDATION & HANDLING
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('portfolio-contact-form');
  const toast = document.getElementById('form-toast');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    clearErrors();

    const nameInput = document.getElementById('sender-name');
    const emailInput = document.getElementById('sender-email');
    const inquiryInput = document.getElementById('inquiry-type');
    const subjectInput = document.getElementById('sender-subject');
    const messageInput = document.getElementById('sender-message');

    let isValid = true;

    if (!nameInput.value.trim()) {
      showError('name-error', 'Please enter your name.');
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      showError('email-error', 'Please enter your email address.');
      isValid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      showError('email-error', 'Please enter a valid email address.');
      isValid = false;
    }

    if (!subjectInput.value.trim()) {
      showError('subject-error', 'Please enter a subject.');
      isValid = false;
    }

    if (!messageInput.value.trim()) {
      showError('message-error', 'Please enter your message.');
      isValid = false;
    } else if (messageInput.value.trim().length < 10) {
      showError('message-error', 'Message should be at least 10 characters.');
      isValid = false;
    }

    if (!isValid) return;

    const recipient = 'alexanderlilian679@gmail.com';
    const encodedSubject = encodeURIComponent(`[Portfolio Inquiry: ${inquiryInput.value}] ${subjectInput.value.trim()}`);
    const encodedBody = encodeURIComponent(
      `Hello Lilian,\n\n${messageInput.value.trim()}\n\n---\nFrom: ${nameInput.value.trim()}\nEmail: ${emailInput.value.trim()}\nInquiry Type: ${inquiryInput.value}`
    );

    window.location.href = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;

    showToastFeedback(
      `Thank you, ${nameInput.value.trim()}! Opening your default email client with your pre-filled inquiry. You can also reach me directly at alexanderlilian679@gmail.com.`
    );

    form.reset();
  });

  function showError(fieldId, message) {
    const el = document.getElementById(fieldId);
    if (el) el.innerText = message;
  }

  function clearErrors() {
    const errorSpans = document.querySelectorAll('.field-error');
    errorSpans.forEach(span => { span.innerText = ''; });
  }

  function showToastFeedback(msg) {
    toast.className = 'form-toast success';
    toast.innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 8000);
  }
}

/* ==========================================================================
   8. COPY TO CLIPBOARD UTILITY
   ========================================================================== */
function initClipboardCopy() {
  const copyButtons = document.querySelectorAll('.copy-email-btn');
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-email') || 'alexanderlilian679@gmail.com';

      navigator.clipboard.writeText(email).then(() => {
        showGlobalToast(`Copied ${email} to clipboard!`);
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showGlobalToast(`Copied ${email} to clipboard!`);
      });
    });
  });

  function showGlobalToast(message) {
    if (!toast) return;
    toastMsg.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

/* ==========================================================================
   9. CURRENT YEAR AUTO-UPDATE
   ========================================================================== */
function initCurrentYear() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.innerText = new Date().getFullYear();
  }
}
