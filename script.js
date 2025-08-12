const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321310762-479e78f5e35f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100'; // Default fallback image

const SAMPLE_EVENTS = [
  {
    id: 'evt1',
    title: 'SA Cloud Summit 2025',
    category: 'Cloud Computing',
    date: '2025-09-24',
    time: '09:00',
    city: 'Cape Town',
    venue: 'CTICC, Convention Square',
    speakers: ['Nkosana Mbatha', 'Aisha Patel'],
    description: 'Join industry leaders to explore cloud computing innovations, AI integrations, and scalable solutions.',
    url: 'https://sacloudsummit.com',
    popularity: 95,
    lat: -33.9152,
    lng: 18.4259,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100' // Cloud computing-themed image
  },
  {
    id: 'evt2',
    title: 'AI & Data Science Conference',
    category: 'Artificial Intelligence',
    date: '2025-10-15',
    time: '10:00',
    city: 'Johannesburg',
    venue: 'Sandton Convention Centre',
    speakers: ['Dr. Thabo Mokoena', 'Lerato Kganyago'],
    description: 'Discover advancements in AI and data science with hands-on workshops and expert keynotes.',
    url: 'https://aiconference.co.za',
    popularity: 85,
    lat: -26.2041,
    lng: 28.0473,
    image: 'https://images.unsplash.com/photo-1516321310762-479e78f5e35f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100' // AI-themed image
  },
  {
    id: 'evt3',
    title: 'Cybersecurity Summit SA',
    category: 'Cybersecurity',
    date: '2025-11-05',
    time: '08:30',
    city: 'Pretoria',
    venue: 'CSIR ICC',
    speakers: ['Michael Zuma', 'Sarah Thwala'],
    description: 'Learn about the latest cybersecurity trends and network with industry experts.',
    url: 'https://cybersecuritysummit.co.za',
    popularity: 90,
    lat: -25.7479,
    lng: 28.2293,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee9b33c45b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100' // Cybersecurity-themed image
  }
];

const LOCAL_KEY = 'techsa_events_v1';
const categories = ['Artificial Intelligence', 'Blockchain', 'Cloud Computing', 'Cybersecurity', 'Data Science', 'FinTech', 'Innovation', 'Startups'];

// City Coordinates for Accurate Mapping
const CITY_COORDINATES = {
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  'Pretoria': { lat: -25.7479, lng: 28.2293 },
  'Durban': { lat: -29.8587, lng: 31.0218 },
  'Stellenbosch': { lat: -33.9321, lng: 18.8602 }
};

// DOM References
const refs = {
  categoryDropdown: document.getElementById('categoryDropdown'),
  categoryDropdownContent: document.getElementById('categoryDropdownContent'),
  selectedCategory: document.getElementById('selectedCategory'),
  eventsGrid: document.getElementById('eventsGrid'),
  resultsCount: document.getElementById('resultsCount'),
  searchInput: document.getElementById('searchInput'),
  citySelect: document.getElementById('citySelect'),
  dateFilter: document.getElementById('dateFilter'),
  sortSelect: document.getElementById('sortSelect'),
  clearFilters: document.getElementById('clearFilters'),
  btnAddEvent: document.getElementById('btnAddEvent'),
  tabs: document.querySelectorAll('.tab'),
  eventsView: document.getElementById('eventsView'),
  mapView: document.getElementById('mapView'),
  addView: document.getElementById('addView'),
  viewMapBtn: document.getElementById('viewMapBtn'),
  eventForm: document.getElementById('eventForm'),
  evTitle: document.getElementById('evTitle'),
  evCategory: document.getElementById('evCategory'),
  evDate: document.getElementById('evDate'),
  evTime: document.getElementById('evTime'),
  evCity: document.getElementById('evCity'),
  evVenue: document.getElementById('evVenue'),
  evDesc: document.getElementById('evDesc'),
  evUrl: document.getElementById('evUrl'),
  evSpeakers: document.getElementById('evSpeakers'),
  evLat: document.getElementById('evLat'),
  evLng: document.getElementById('evLng'),
  evImage: document.getElementById('evImage'),
  btnClearForm: document.getElementById('btnClearForm'),
  btnPickLocation: document.getElementById('btnPickLocation'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalContent: document.getElementById('modalContent'),
  closeModal: document.getElementById('closeModal'),
  featuredTitle: document.getElementById('featuredTitle'),
  featuredDesc: document.getElementById('featuredDesc'),
  featuredBtn: document.getElementById('featuredBtn'),
  shareFeatured: document.getElementById('shareFeatured'),
  btnLocate: document.getElementById('btnLocate'),
  mapSearch: document.getElementById('mapSearch'),
  mapSearchBtn: document.getElementById('mapSearchBtn')
};

// App State
let state = {
  events: [],
  activeCategory: '',
  viewMode: 'list',
  pickingLocation: false
};

let mapState = {
  fullMap: null,
  markerClusterGroup: null,
  miniMapInstance: null,
  miniMapRight: null,
  mapMarkers: {}
};

// Utility Functions
const utils = {
  escapeHtml: (str) => (str || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]),
  debounce: (fn, wait) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },
  formatDate: (dateStr, timeStr) => {
    const dateObj = dateStr ? new Date(dateStr + 'T' + (timeStr || '09:00')) : null;
    return {
      day: dateObj ? dateObj.getDate() : '',
      month: dateObj ? dateObj.toLocaleString('default', { month: 'short' }) : '',
      time: timeStr || ''
    };
  },
  isValidImageUrl: (url) => {
    return url && (url.startsWith('http') || url.startsWith('blob:')) ? url : FALLBACK_IMAGE;
  }
};

// Storage Functions
const storage = {
  loadEvents: () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      state.events = raw ? JSON.parse(raw) : SAMPLE_EVENTS.slice();
      storage.saveEvents();
    } catch (e) {
      state.events = SAMPLE_EVENTS.slice();
      storage.saveEvents();
    }
  },
  saveEvents: () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state.events));
  }
};

// API Integration
const apiManager = {
  fetchEvents: async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
      if (!response.ok) throw new Error('API fetch failed');
      const posts = await response.json();
      const today = new Date('2025-08-12');
      const techImageMap = {
        'Cloud Computing': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100',
        'Artificial Intelligence': 'https://images.unsplash.com/photo-1516321310762-479e78f5e35f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100',
        'Cybersecurity': 'https://images.unsplash.com/photo-1563986768494-4dee9b33c45b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100',
        'Blockchain': 'https://images.unsplash.com/photo-1639322537228-f714d3e8168d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100',
        'Data Science': 'https://images.unsplash.com/photo-1551288049-b1f3a0b35e74?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100',
        'FinTech': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100',
        'Innovation': 'https://images.unsplash.com/photo-1516321310762-479e78f5e35f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100',
        'Startups': 'https://images.unsplash.com/photo-1516321310762-479e78f5e35f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=100'
      };
      state.events = posts.map((post, index) => {
        const eventDate = new Date(`2025-${String(10 + (index % 3)).padStart(2, '0')}-${String(1 + (index % 28)).padStart(2, '0')}`);
        if (eventDate < today) {
          eventDate.setFullYear(eventDate.getFullYear() + 1);
        }
        const dateStr = eventDate.toISOString().split('T')[0];
        const cities = ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Stellenbosch'];
        const venues = ['CTICC', 'Sandton Convention Centre', 'CSIR ICC', 'ICC Durban', 'Stellenbosch University'];
        const categoriesList = ['Artificial Intelligence', 'Blockchain', 'Cloud Computing', 'Cybersecurity', 'Data Science', 'FinTech', 'Innovation', 'Startups'];
        const city = cities[index % 5];
        const coords = CITY_COORDINATES[city] || { lat: -30.0 + (Math.random() * 5), lng: 24.0 + (Math.random() * 5) };
        return {
          id: `evt${index + 1}`,
          title: `SA Tech ${categoriesList[index % categoriesList.length]} Summit ${2025 + (index % 2)}`,
          category: categoriesList[index % categoriesList.length],
          date: dateStr,
          time: `${String(8 + (index % 12)).padStart(2, '0')}:00`,
          city: city,
          venue: venues[index % 5],
          speakers: [`Expert ${index + 1}`, `Dr. Guest ${index + 2}`],
          description: `Join us for a deep dive into ${categoriesList[index % categoriesList.length].toLowerCase()} trends and innovations in South Africa.`,
          url: `https://satech${index + 1}.co.za`,
          popularity: Math.floor(Math.random() * 100),
          lat: coords.lat,
          lng: coords.lng,
          image: techImageMap[categoriesList[index % categoriesList.length]] || FALLBACK_IMAGE
        };
      }).filter(event => new Date(event.date) >= today);
      storage.saveEvents();
      eventsManager.applyFilters();
      app.updateFeaturedEvent();
    } catch (e) {
      console.error('Failed to fetch events:', e);
      storage.loadEvents();
      eventsManager.applyFilters();
    }
  },
  postEvent: async (event) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: event.title,
          body: event.description,
          userId: 1
        })
      });
      if (!response.ok) throw new Error('API post failed');
      return await response.json();
    } catch (e) {
      console.error('Failed to post event:', e);
      return null;
    }
  }
};

// Event Rendering
const eventsManager = {
  renderEvents: (list) => {
    refs.eventsGrid.innerHTML = '';
    if (list.length === 0) {
      refs.eventsGrid.innerHTML = '<div class="small-muted" style="padding: 16px; text-align: center; grid-column: 1 / -1;">No events found. Try clearing filters.</div>';
      eventsManager.updateResultsCount(0);
      mapManager.clearMarkers();
      return;
    }

    list.forEach((ev) => {
      const card = document.createElement('article');
      card.className = 'event-card';
      const { day, month, time } = utils.formatDate(ev.date, ev.time);
      card.innerHTML = `
        <img src="${utils.escapeHtml(utils.isValidImageUrl(ev.image))}" alt="${utils.escapeHtml(ev.title)}" class="event-image" onerror="this.src='${FALLBACK_IMAGE}';" loading="lazy" />
        <div class="date-box">
          <div class="day">${day}</div>
          <div class="month">${month}</div>
          <div class="time">${time}</div>
        </div>
        <div class="event-body">
          <h3 class="event-title" title="${utils.escapeHtml(ev.title)}">${utils.escapeHtml(ev.title)}</h3>
          <div class="meta" title="${utils.escapeHtml(ev.city || '—')} • ${utils.escapeHtml(ev.venue || '—')} • ${ev.date || 'TBA'}">
            <i class="fas fa-map-marker-alt"></i> ${utils.escapeHtml(ev.city || '—')} • ${utils.escapeHtml(ev.venue || '—')} • ${ev.date || 'TBA'}
          </div>
          <p class="event-description" title="${utils.escapeHtml(ev.description || '')}">${utils.escapeHtml(ev.description || '')}</p>
          <div class="tags">
            <div class="tag"><i class="fas fa-folder"></i> ${utils.escapeHtml(ev.category)}</div>
            ${ev.speakers && ev.speakers.length ? `<div class="tag"><i class="fas fa-users"></i> ${ev.speakers.map(s => utils.escapeHtml(s)).join(', ')}</div>` : ''}
          </div>
          <div class="event-actions">
            <button class="btn" data-id="${ev.id}" onclick="app.openEventModal('${ev.id}')"><i class="fas fa-eye"></i> View</button>
            <button class="chip" onclick="app.openRegistration('${ev.id}')"><i class="fas fa-ticket-alt"></i> Register</button>
            <button class="chip" onclick="app.shareEvent('${ev.id}')"><i class="fas fa-share-alt"></i> Share</button>
          </div>
        </div>
      `;
      refs.eventsGrid.appendChild(card);
    });

    eventsManager.updateResultsCount(list.length);
    mapManager.refreshMapMarkers(list);
  },
  updateResultsCount: (n) => {
    const count = n !== undefined ? n : document.querySelectorAll('.event-card').length;
    refs.resultsCount.textContent = `Showing ${count} event${count === 1 ? '' : 's'}`;
  },
  applyFilters: () => {
    let list = [...state.events];

    if (state.activeCategory) {
      list = list.filter((e) => e.category.toLowerCase().includes(state.activeCategory.toLowerCase()));
    }
    if (refs.searchInput.value.trim()) {
      const q = refs.searchInput.value.trim().toLowerCase();
      list = list.filter((e) => ((e.title || '') + ' ' + (e.description || '') + ' ' + (e.speakers || []).join(' ') + ' ' + (e.city || '') + ' ' + (e.venue || '')).toLowerCase().includes(q));
    }
    if (refs.citySelect.value) {
      list = list.filter((e) => e.city === refs.citySelect.value);
    }
    if (refs.dateFilter.value) {
      list = list.filter((e) => e.date === refs.dateFilter.value);
    }

    const sort = refs.sortSelect.value;
    if (sort === 'dateAsc') list.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sort === 'dateDesc') list.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sort === 'city') list.sort((a, b) => (a.city || '').localeCompare(b.city || ''));
    else if (sort === 'popularity') list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    eventsManager.renderEvents(list);
  }
};

// Map Management
const mapManager = {
  initMaps: () => {
    mapState.fullMap = L.map('mapFull', { minZoom: 5 }).setView([-26.0, 28.0], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapState.fullMap);
    mapState.markerClusterGroup = L.markerClusterGroup();
    mapState.fullMap.addLayer(mapState.markerClusterGroup);

    mapState.miniMapInstance = L.map('miniMap', { attributionControl: false }).setView([-26.0, 28.0], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapState.miniMapInstance);

    mapState.miniMapInstance.on('click', (e) => {
      if (!state.pickingLocation) return;
      const { lat, lng } = e.latlng;
      mapManager.setAddLocation(lat, lng);
      state.pickingLocation = false;
      mapState.miniMapInstance.eachLayer((l) => {
        if (l.options && l.options.pane === 'markerPane') mapState.miniMapInstance.removeLayer(l);
      });
      L.marker([lat, lng]).addTo(mapState.miniMapInstance);
    });

    mapState.miniMapRight = L.map('miniMapRight', { attributionControl: false, zoomControl: false }).setView([-26.0, 28.0], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapState.miniMapRight);
  },
  clearMarkers: () => {
    if (mapState.markerClusterGroup) mapState.markerClusterGroup.clearLayers();
    Object.keys(mapState.mapMarkers).forEach((k) => delete mapState.mapMarkers[k]);
  },
  refreshMapMarkers: (list) => {
    if (!mapState.markerClusterGroup) return;
    mapManager.clearMarkers();
    list.forEach((ev) => {
      if (ev.lat && ev.lng) {
        const m = L.marker([ev.lat, ev.lng]);
        const popupHtml = `
          <strong>${utils.escapeHtml(ev.title)}</strong><br>
          ${utils.escapeHtml(ev.city || '')} • ${ev.date || ''}<br>
          <div style="margin-top: 8px;">
            <button class="btn" onclick="app.openEventModal('${ev.id}')"><i class="fas fa-eye"></i> View</button>
            <button class="chip" onclick="app.openRegistration('${ev.id}')"><i class="fas fa-ticket-alt"></i> Register</button>
          </div>`;
        m.bindPopup(popupHtml);
        mapState.markerClusterGroup.addLayer(m);
        mapState.mapMarkers[ev.id] = m;
      }
    });
    mapState.miniMapRight.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapState.miniMapRight.removeLayer(layer);
    });
    list.forEach((ev) => {
      if (ev.lat && ev.lng) {
        L.marker([ev.lat, ev.lng]).addTo(mapState.miniMapRight).bindPopup(utils.escapeHtml(ev.title));
      }
    });
  },
  setAddLocation: (lat, lng) => {
    refs.evLat.value = parseFloat(lat).toFixed(6);
    refs.evLng.value = parseFloat(lng).toFixed(6);
    mapState.miniMapInstance.setView([lat, lng], 13);
  }
};

// Application Logic
const app = {
  init: () => {
    apiManager.fetchEvents();
    mapManager.initMaps();
    setTimeout(() => mapManager.refreshMapMarkers(state.events), 200);
    app.updateFeaturedEvent();
    app.setupEventListeners();
  },
  setupEventListeners: () => {
    refs.searchInput.addEventListener('input', utils.debounce(eventsManager.applyFilters, 250));
    refs.citySelect.addEventListener('change', eventsManager.applyFilters);
    refs.dateFilter.addEventListener('change', eventsManager.applyFilters);
    refs.sortSelect.addEventListener('change', eventsManager.applyFilters);
    refs.clearFilters.addEventListener('click', () => {
      refs.searchInput.value = '';
      refs.citySelect.value = '';
      refs.dateFilter.value = '';
      refs.sortSelect.value = 'dateAsc';
      state.activeCategory = '';
      refs.selectedCategory.textContent = 'Select Category';
      document.querySelectorAll('.dropdown-item.active').forEach((el) => el.classList.remove('active'));
      eventsManager.applyFilters();
    });

    refs.tabs.forEach((t) => {
      t.addEventListener('click', () => app.switchTab(t.dataset.tab));
    });

    refs.viewMapBtn.addEventListener('click', () => app.switchTab('map'));

    refs.categoryDropdown.addEventListener('click', () => {
      refs.categoryDropdown.classList.toggle('active');
      refs.categoryDropdownContent.classList.toggle('show');
      refs.categoryDropdown.setAttribute('aria-expanded', refs.categoryDropdown.classList.contains('active'));
    });

    document.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', () => {
        state.activeCategory = item.dataset.category;
        refs.selectedCategory.textContent = state.activeCategory || 'Select Category';
        document.querySelectorAll('.dropdown-item').forEach((el) => el.classList.remove('active'));
        if (state.activeCategory) item.classList.add('active');
        refs.categoryDropdown.classList.remove('active');
        refs.categoryDropdownContent.classList.remove('show');
        refs.categoryDropdown.setAttribute('aria-expanded', 'false');
        eventsManager.applyFilters();
      });
    });

    document.addEventListener('click', (e) => {
      if (!refs.categoryDropdown.contains(e.target)) {
        refs.categoryDropdown.classList.remove('active');
        refs.categoryDropdownContent.classList.remove('show');
        refs.categoryDropdown.setAttribute('aria-expanded', 'false');
      }
    });

    refs.closeModal.addEventListener('click', () => {
      refs.modalBackdrop.classList.remove('show');
      refs.modalBackdrop.setAttribute('aria-hidden', 'true');
    });
    refs.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === refs.modalBackdrop) {
        refs.modalBackdrop.classList.remove('show');
        refs.modalBackdrop.setAttribute('aria-hidden', 'true');
      }
    });

    refs.eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = refs.evTitle.value.trim();
      if (!title) {
        alert('Title is required');
        return;
      }
      const id = 'evt' + Date.now();
      let imageUrl = FALLBACK_IMAGE;
      if (refs.evImage.files && refs.evImage.files[0]) {
        const file = refs.evImage.files[0];
        if (!file.type.startsWith('image/')) {
          alert('Please upload a valid image file (JPEG, PNG, etc.).');
          return;
        }
        imageUrl = URL.createObjectURL(refs.evImage.files[0]);
      }
      const city = refs.evCity.value.trim();
      const coords = CITY_COORDINATES[city] || { lat: parseFloat(refs.evLat.value) || undefined, lng: parseFloat(refs.evLng.value) || undefined };
      const newEv = {
        id,
        title,
        category: refs.evCategory.value,
        date: refs.evDate.value,
        time: refs.evTime.value,
        city: city,
        venue: refs.evVenue.value,
        speakers: refs.evSpeakers.value ? refs.evSpeakers.value.split(',').map((s) => s.trim()) : [],
        description: refs.evDesc.value,
        url: refs.evUrl.value,
        popularity: 10,
        lat: coords.lat,
        lng: coords.lng,
        image: imageUrl
      };

      if (!newEv.city && newEv.lat && newEv.lng) {
        const city = await app.reverseGeocode(newEv.lat, newEv.lng);
        if (city) newEv.city = city;
      }

      await apiManager.postEvent(newEv);
      state.events.push(newEv);
      storage.saveEvents();
      eventsManager.applyFilters();
      app.updateFeaturedEvent();
      alert('Event saved successfully! View it in the Events tab.');
      app.switchTab('events');
      refs.eventForm.reset();
      refs.evLat.value = '';
      refs.evLng.value = '';
      mapState.miniMapInstance.eachLayer((l) => {
        if (l instanceof L.Marker) mapState.miniMapInstance.removeLayer(l);
      });
    });

    refs.btnClearForm.addEventListener('click', () => {
      refs.eventForm.reset();
      refs.evLat.value = '';
      refs.evLng.value = '';
      state.pickingLocation = false;
      mapState.miniMapInstance.eachLayer((l) => {
        if (l instanceof L.Marker) mapState.miniMapInstance.removeLayer(l);
      });
    });

    refs.btnPickLocation.addEventListener('click', () => {
      state.pickingLocation = true;
      alert('Click the map below to pick the event location.');
    });

    refs.btnLocate.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation not supported in this browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          mapState.fullMap.setView([lat, lng], 12);
          L.marker([lat, lng]).addTo(mapState.fullMap).bindPopup('You are here:)').openPopup();
        },
        (err) => {
          alert('Unable to retrieve your location: ' + (err.message || 'permission denied:('));
        }
      );
    });

    refs.mapSearchBtn.addEventListener('click', async () => {
      const q = refs.mapSearch.value.trim();
      if (!q) return;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q + ', South Africa')}`;
        const r = await fetch(url);
        const data = await r.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon);
          mapState.fullMap.setView([lat, lng], 12);
        } else {
          alert('Location not found');
        }
      } catch (e) {
        alert('Search failed');
      }
    });

    refs.shareFeatured.addEventListener('click', () => app.shareEvent('evt1'));
  },
  switchTab: (name) => {
    refs.tabs.forEach((tb) => tb.classList.toggle('active', tb.dataset.tab === name));
    refs.eventsView.style.display = name === 'events' ? '' : 'none';
    refs.mapView.style.display = name === 'map' ? '' : 'none';
    refs.addView.style.display = name === 'add' ? '' : 'none';
    state.viewMode = name === 'map' ? 'map' : 'list';
    if (name === 'map') setTimeout(() => mapState.fullMap.invalidateSize(), 100);
    if (name === 'add') setTimeout(() => mapState.miniMapInstance.invalidateSize(), 100);
  },
  openEventModal: (id) => {
    const ev = state.events.find((e) => e.id === id);
    if (!ev) return;
    refs.modalContent.innerHTML = `
      <img src="${utils.escapeHtml(utils.isValidImageUrl(ev.image))}" alt="${utils.escapeHtml(ev.title)}" style="width: 100%; border-radius: 8px; margin-bottom: 12px;" onerror="this.src='${FALLBACK_IMAGE}';" loading="lazy" />
      <h2 style="margin-top: 0; font-family: Poppins; font-weight: 700; font-size: 24px;">${utils.escapeHtml(ev.title)}</h2>
      <div class="small-muted"><i class="fas fa-map-marker-alt"></i> ${utils.escapeHtml(ev.city)} • ${utils.escapeHtml(ev.venue)} • ${ev.date} ${ev.time || ''}</div>
      <p style="margin-top: 12px; font-size: 14px;">${utils.escapeHtml(ev.description || '')}</p>
      <div style="margin-top: 10px;"><strong>Speakers</strong></div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px;">
        ${(ev.speakers || []).map((s) => `<div style="padding: 8px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e9ecef; font-size: 13px;">${utils.escapeHtml(s)}</div>`).join('')}
      </div>
      <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn" onclick="app.openRegistration('${ev.id}')"><i class="fas fa-ticket-alt"></i> Register</button>
        <a class="chip" href="${utils.escapeHtml(ev.url || '#')}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><i class="fas fa-link"></i> Event Page</a>
        ${ev.lat && ev.lng ? `<button class="chip" onclick="app.openMapFor(${ev.lat}, ${ev.lng})"><i class="fas fa-map-marked-alt"></i> Open in Maps</button>` : ''}
      </div>
    `;
    refs.modalBackdrop.classList.add('show');
    refs.modalBackdrop.setAttribute('aria-hidden', 'false');
  },
  openRegistration: (id) => {
    const ev = state.events.find((e) => e.id === id);
    alert(`Registration flow  — ${ev ? utils.escapeHtml(ev.title) : ''}\nThis is just a demo.`);
  },
  shareEvent: (id) => {
    const ev = state.events.find((e) => e.id === id);
    if (!ev) return;
    const text = `${ev.title} — ${ev.city} on ${ev.date}.`;
    if (navigator.share) {
      navigator.share({ title: ev.title, text, url: ev.url || location.href }).catch(() => {});
    } else {
      prompt('Copy event details', text + ' ' + (ev.url || ''));
    }
  },
  openMapFor: (lat, lng) => {
    const q = encodeURIComponent(`${lat},${lng}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  },
  reverseGeocode: async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!r.ok) return '';
      const data = await r.json();
      if (data && data.address) {
        const { city, town, village, state, county } = data.address;
        return city || town || village || state || county || '';
      }
    } catch (e) {}
    return '';
  },
  updateFeaturedEvent: () => {
    const featured = state.events.find((e) => e.id === 'evt1') || state.events[0];
    if (featured) {
      refs.featuredTitle.textContent = `${utils.escapeHtml(featured.title)} — ${utils.escapeHtml(featured.city)}`;
      refs.featuredDesc.textContent = utils.escapeHtml(featured.description);
      refs.featuredBtn.href = featured.url || '#';
      // Note: If the featured section includes an image in the HTML, ensure it uses featured.image
      const featuredImage = document.getElementById('featuredImage');
      if (featuredImage) {
        featuredImage.src = utils.isValidImageUrl(featured.image);
        featuredImage.setAttribute('onerror', `this.src='${FALLBACK_IMAGE}';`);
        featuredImage.setAttribute('loading', 'lazy');
      }
    }
  }
};

// Initialize
window.addEventListener('DOMContentLoaded', app.init);

// Expose global functions
window.app = {
  openEventModal: app.openEventModal,
  openRegistration: app.openRegistration,
  shareEvent: app.shareEvent,
  openMapFor: app.openMapFor,
  switchTab: app.switchTab
};