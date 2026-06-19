// app.js – Dynamically populate the tourism gallery and handle UI interactions

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile Navigation Toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }

  // Sticky Navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Fetch and display attractions
  try {
    const response = await fetch('data/attractions.json');
    const data = await response.json();
    
    const destinationsGrid = document.getElementById('destinationsGrid');
    const filterBar = document.getElementById('filterBar');
    
    if (destinationsGrid && filterBar && data.categories) {
      // Create filter buttons
      data.categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = category.id;
        btn.textContent = category.title;
        filterBar.appendChild(btn);
      });

      // Render all categories initially
      renderCategories(data.categories, destinationsGrid);

      // Filter functionality
      const filterBtns = document.querySelectorAll('.filter-btn');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filter = btn.dataset.filter;
          if (filter === 'all') {
            renderCategories(data.categories, destinationsGrid);
          } else {
            const filteredCategories = data.categories.filter(c => c.id === filter);
            renderCategories(filteredCategories, destinationsGrid);
          }
        });
      });
    }

    animateStats();

  } catch (error) {
    console.error("Error loading attractions data:", error);
  }

  // Lightbox functionality
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxLocation = document.getElementById('lightboxLocation');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
      lightbox.style.display = 'none';
      lightbox.style.opacity = '0';
      lightbox.style.pointerEvents = 'none';
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        lightbox.style.display = 'none';
        lightbox.style.opacity = '0';
        lightbox.style.pointerEvents = 'none';
      }
    });
  }

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

function renderCategories(categories, container) {
  container.innerHTML = '';
  
  categories.forEach(category => {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <span class="category-icon">${category.icon}</span>
      <h3>${category.title}</h3>
      <p>${category.subtitle}</p>
    `;
    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'category-grid';

    category.attractions.forEach(item => {
      const card = document.createElement('div');
      card.className = 'dest-card visible';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.innerHTML = `
        <div class="dest-card-img">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          <span class="dest-card-badge">★ ${item.rating}</span>
        </div>
        <div class="dest-card-body">
          <h4>${item.title}</h4>
          <span class="dest-card-location">📍 ${item.location}</span>
          <p>${item.description}</p>
          <div class="dest-card-footer">
            <span>Best time: ${item.bestTime}</span>
          </div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const lightboxDesc = document.getElementById('lightboxDesc');
        const lightboxLocation = document.getElementById('lightboxLocation');
        
        lightboxImg.src = item.image;
        lightboxImg.alt = item.title;
        lightboxTitle.textContent = item.title;
        lightboxDesc.textContent = item.description;
        lightboxLocation.textContent = `📍 ${item.location} | ⭐ ${item.rating}`;
        
        lightbox.style.display = 'flex';
        lightbox.style.opacity = '1';
        lightbox.style.pointerEvents = 'all';
        lightbox.classList.add('active');
      });

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
    const targetAttr = stat.getAttribute('data-count');
    if (!targetAttr) return;
    const target = parseInt(targetAttr);
    const suffix = stat.getAttribute('data-suffix') || '';
    let current = 0;
    const increment = target / 50;
    
    const updateStat = () => {
      if (current < target) {
        current += increment;
        stat.innerText = Math.ceil(current) + suffix;
        setTimeout(updateStat, 30);
      } else {
        stat.innerText = target + suffix;
      }
    };
    
    // Using Intersection Observer to trigger stats animation
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        updateStat();
        observer.unobserve(stat);
      }
    });
    observer.observe(stat);
  });
}

// Fade-in animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-animate], .feature-card, .stat-item, .testimonial-card').forEach(el => {
    observer.observe(el);
  });
});
