mergeInto(LibraryManager.library, {

  GetNFTData: function () {
    var nftDataTempStr = window.localStorage.getItem('_nftdatatemp');
    var bufferSize = lengthBytesUTF8(nftDataTempStr) + 1;
    var buffer = _malloc(bufferSize);
    stringToUTF8(nftDataTempStr, buffer, bufferSize);
    return buffer;
  },

  ReturnToWebsite: function() {
    window.location.href = "../";
  }

});