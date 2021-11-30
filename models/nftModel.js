const mongoose = require('mongoose');

const NftModel = mongoose.model('NftModel', {
  id: { type: String, required: true, unique: true },
  name: { type: String, required: false },
  transferable: { type: Number, required: false },
  issuer: { type: String, required: false },
  metadata: { type: String, required: false },
  image: { type: String, required: false },
  cacheImage: { type: String, required: false },
  currentOwner: { type: String, required: false },
  price: { type: String, required: false },
  // burned: { type: Boolean, required: false },
  blockNumber: { type: String, required: false }
})

module.exports = NftModel;
