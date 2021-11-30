const fastify = require('fastify')({
  logger: false
});
const path = require('path');
const cron = require('node-cron');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const nftModel = require('./models/nftModel');
const fetchNFTs = require('./fetchNFTs');

fastify.register(require('fastify-cors'), {
   origin: "*",
   allowedHeaders: ['Origin', 'X-Requested-With', 'Accept', 'Content-Type', 'Authorization'],
   methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE']
})

fastify.register(require('fastify-compress'))

function setHeaders(res, filePath) {
  const parsedPath = path.parse(filePath)

  if (parsedPath.name.includes('.wasm')) {
    res.setHeader('Content-Type', 'application/wasm')
  } else if (parsedPath.name.includes('.js')) {
    res.setHeader('Content-Type', 'application/javascript')
  }

  if (parsedPath.ext === '.gz') {
    res.setHeader('Content-Encoding', 'gzip')
  } else if (parsedPath.ext === '.br') {
    res.setHeader('Content-Encoding', 'br')
  } else {
    return
  }

  if (path.extname(parsedPath.name) === '.html') {
    res.setHeader('Content-Type', 'text/html')
  }
}

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'build'),
  setHeaders: setHeaders
})

fastify.get('*', function (req, reply) {
  return reply.sendFile('index.html', path.join(__dirname, 'build'))
})

fastify.get('/api/nfts', function (req, reply) {
  nftModel.find({}, {'name':1, 'id':1, 'cacheImage':1, '_id':0}).then((nfts)=>{
    reply
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(nfts);
  });
})

fastify.get('/api/nfts/owned', async function (req, reply) {
  let nfts = [];
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
      body: JSON.stringify({"query":"query {  nFTEntities(    filter: {      issuer: { equalTo: \"H9vFZTsDmpbHMJoF4sy49q1qoyBBPxJBNYQWheQAPBdXexH\" }, currentOwner: { equalTo: \""+req.query.address+"\" }    }  ) {    nodes {      name      instance      transferable      issuer      sn      id      metadata      currentOwner      price      burned      blockNumber    }  }}"})
  })
  .then(r => r.json())
  .then(async (r) => {
    const nftsFetched = r.data.nFTEntities.nodes.reduce((before, value, index) => {
      if (!value.name.includes('Egg') && (value.burned === null || value.burned === false)) {
        before.push(value);
      }
      return before;
    }, []);
    if (nftsFetched && nftsFetched.length > 0)
    {
      let fetchFromDatabase = new Promise((resolve, reject) => {
        nftsFetched.forEach(async (nft, index, array) => {
            let n = await nftModel.find({id: nft.id}).exec();
            nfts.push(n[0]);
            if (index === array.length -1) resolve();
        });
      });
      let isFetched = await fetchFromDatabase;
    }
    reply
    .code(200)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(nfts);
  })
  .catch(err => {
    reply
    .code(500)
    .header('Content-Type', 'application/json; charset=utf-8')
    .send(nfts);
  });
})

const startServer = async () => {
  await mongoose.connect(`mongodb+srv://admin:admin@cluster0.zwbfy.mongodb.net/cryptosamas?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Mongodb connect OK');

  console.log(process.env.NODE_ENV);
  fetchNFTs();
  if (process.env.NODE_ENV === 'production') {
    cron.schedule('0 9 * * *', () => {
      fetchNFTs();
    });
  }

  try {
    await fastify.listen(process.env.PORT || 3001, process.env.HOST || '::')
    console.log('Fastify listen OK')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
startServer()
