const fs = require('fs');
const file = 'data/attractions.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.categories.forEach(cat => {
  cat.attractions.forEach((attr, idx) => {
    // extract a keyword from the title
    let keyword = attr.title.split(' ')[0].toLowerCase();
    if(keyword === 'mount' || keyword === 'lake' || keyword === 'the') {
        keyword = attr.title.split(' ')[1].toLowerCase();
    }
    keyword = keyword.replace(/[^a-z]/g, '');
    
    // Unsplash random image with keyword is better if we use standard API, but loremflickr works too.
    // To ensure uniqueness, we can append a random or index number.
    attr.image = `https://loremflickr.com/600/400/${keyword}?lock=${Math.floor(Math.random() * 1000) + idx}`;
  });
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Images updated successfully');
