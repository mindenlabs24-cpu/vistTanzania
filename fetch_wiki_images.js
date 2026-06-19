const fs = require('fs');
const https = require('https');

const file = 'data/attractions.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const pageMap = {
  "Mount Kilimanjaro": "Mount_Kilimanjaro",
  "Mount Meru": "Mount_Meru_(Tanzania)",
  "Ol Doinyo Lengai": "Ol_Doinyo_Lengai",
  "Udzungwa Mountains": "Udzungwa_Mountains_National_Park",
  "Serengeti National Park": "Serengeti_National_Park",
  "Ngorongoro Crater": "Ngorongoro_Conservation_Area",
  "Tarangire National Park": "Tarangire_National_Park",
  "Selous Game Reserve": "Selous_Game_Reserve",
  "Great Rift Valley": "Great_Rift_Valley",
  "Olduvai Gorge": "Olduvai_Gorge",
  "Usambara Mountains Valley": "Usambara_Mountains",
  "Lake Victoria": "Lake_Victoria",
  "Lake Tanganyika": "Lake_Tanganyika",
  "Lake Natron": "Lake_Natron",
  "Rufiji River": "Rufiji_River",
  "Kalambo Falls": "Kalambo_Falls",
  "Materuni Waterfalls": "Kilimanjaro_Region", 
  "Sanje Waterfalls": "Udzungwa_Mountains_National_Park",
  "Stone Town, Zanzibar": "Stone_Town",
  "Kilwa Kisiwani Ruins": "Kilwa_Kisiwani",
  "Bagamoyo Historic Town": "Bagamoyo",
  "Kondoa Rock Art Sites": "Kondoa_Rock-Art_Sites"
};

async function fetchWikiImage(title) {
  const pageTitle = pageMap[title] || title.replace(/ /g, '_');
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=600`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'VistTanzaniaApp/1.0' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function updateImages() {
  for (let cat of data.categories) {
    for (let attr of cat.attractions) {
      const imgUrl = await fetchWikiImage(attr.title);
      if (imgUrl) {
        attr.image = imgUrl;
        console.log(`Found image for ${attr.title}: ${imgUrl}`);
      } else {
        console.log(`No image for ${attr.title}, using fallback`);
        // Use a generic beautiful Tanzania landscape fallback
        attr.image = `https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Serengeti_National_Park%2C_Tanzania_-_Panoramio_%281%29.jpg/600px-Serengeti_National_Park%2C_Tanzania_-_Panoramio_%281%29.jpg`;
      }
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Done updating images!');
}

updateImages();
