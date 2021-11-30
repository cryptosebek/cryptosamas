const fs = require('fs');
const fetch = require('node-fetch');
const sharp = require('sharp');
const nftModel = require('./models/nftModel');

const dir = './build/static/media/nftcache/';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const precacheImage = async(url) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const imgName = `${dir}${url.substring(url.lastIndexOf('/') + 1)}.jpg_original`;
  fs.writeFile(imgName, buffer, () => {
    sharp(imgName)
      .resize(512, 734)
      // .jpeg({ mozjpeg: true })
      .toFile(imgName.replace('_original', ''))
      .then(data => {
        fs.unlinkSync(imgName);
        console.log('precached: ' + imgName.replace('_original', ''));
      })
      .catch(err => {
        console.error(err);
      });
  });
}

const fetchNFTs = async() => {
  fetch('https://api.subquery.network/sq/vikiival/magick', {
      method: 'POST',
      headers: {
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Origin': 'https://www.cryptosamas.com'
      },
      body: JSON.stringify({"query":"query {  nFTEntities(    filter: {      issuer: { equalTo: \"H9vFZTsDmpbHMJoF4sy49q1qoyBBPxJBNYQWheQAPBdXexH\" }    }  ) {    nodes {      name      instance      transferable      issuer      sn      id      metadata      currentOwner      price      burned      blockNumber    }  }}"})
  })
  .then(r => r.json())
  .then(async (r) => {
    await nftModel.deleteMany({});
    const nfts = r.data.nFTEntities.nodes.reduce((before, value, index) => {
      if (!value.name.includes('Egg') && (value.burned === null || value.burned === false)) {
        before.push(value);
      }
      return before;
    }, []);
    nfts.forEach(async (n, i) => {
      fetch('https://rmrk.mypinata.cloud/ipfs/' + n.metadata.replace('ipfs://ipfs/', '')).then(t => t.json()).then(async (t) => {
        let d = n;
        d.image = 'https://rmrk.mypinata.cloud/ipfs/' + t.image.replace('ipfs://ipfs/', '');
        d.cacheImage = '/static/media/nftcache/' + t.image.replace('ipfs://ipfs/', '') + '.jpg'
        await nftModel.update({id: n.id}, d, {upsert: true});
        await precacheImage(d.image);
      })
    });
  });
}

module.exports = fetchNFTs;
