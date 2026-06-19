const https = require('https');
const fs = require('fs');

const file = 'data/attractions.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

async function searchWikiImage(query) {
  // Try finding an exact match or the closest Wikipedia article
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
  return new Promise(resolve => {
    https.get(searchUrl, { headers: { 'User-Agent': 'VistTanzaniaApp/1.0' } }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.query && json.query.search && json.query.search.length > 0) {
             const title = json.query.search[0].title;
             const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
             https.get(pageUrl, { headers: { 'User-Agent': 'VistTanzaniaApp/1.0' } }, res2 => {
               let body2 = '';
               res2.on('data', chunk => body2 += chunk);
               res2.on('end', () => {
                 try {
                   const json2 = JSON.parse(body2);
                   const pages = json2.query.pages;
                   const pageId = Object.keys(pages)[0];
                   if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
                     resolve(pages[pageId].thumbnail.source);
                   } else {
                     resolve(null);
                   }
                 } catch(e) { resolve(null); }
               });
             }).on('error', () => resolve(null));
          } else {
             resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// Fallback manual URLs for specific ones that might still fail
const manualFallbacks = {
  "Usambara Mountains Valley": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Usambara_Mountains.jpg/800px-Usambara_Mountains.jpg",
  "Rufiji River": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Rufiji_River_Tanzania.jpg/800px-Rufiji_River_Tanzania.jpg",
  "Kalambo Falls": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Kalambo_Falls_Zambia.jpg/800px-Kalambo_Falls_Zambia.jpg",
  "Materuni Waterfalls": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Materuni_Waterfall.jpg/800px-Materuni_Waterfall.jpg",
  "Sanje Waterfalls": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Sanje_waterfalls.jpg/800px-Sanje_waterfalls.jpg",
  "Kondoa Rock Art Sites": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Kondoa_Irangi_Rock_Art.jpg/800px-Kondoa_Irangi_Rock_Art.jpg"
};

async function fixImages() {
   let modified = false;
   for (let cat of data.categories) {
     for (let attr of cat.attractions) {
       if (attr.image.includes('Panoramio')) {
          let imgUrl = await searchWikiImage(attr.title);
          if (!imgUrl && manualFallbacks[attr.title]) {
              imgUrl = manualFallbacks[attr.title];
          }
          if (imgUrl) {
             attr.image = imgUrl;
             console.log('Fixed:', attr.title, imgUrl);
             modified = true;
          } else {
             console.log('Still no image for:', attr.title);
          }
       }
     }
   }
   if(modified) {
     fs.writeFileSync(file, JSON.stringify(data, null, 2));
     console.log('Done fixing remaining images!');
   }
}

fixImages();
