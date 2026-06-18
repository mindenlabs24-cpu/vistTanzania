// app.js – Dynamically populate the tourism gallery
document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('data/attractions.json');
  const attractions = await response.json();
  const gallery = document.getElementById('gallery');
  attractions.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy" />
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    `;
    gallery.appendChild(card);
  });
});
