import './css/App.css';
import React, { Component } from 'react';
import { BrowserView, MobileView } from 'react-device-detect'; //, isBrowser, isMobile

import { Select, SelectMenu, Button, Pane, Dialog, majorScale, toaster } from 'evergreen-ui'

import Carousel from 'react-spring-3d-carousel';

// import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  // web3Accounts,
  web3AccountsSubscribe,
  web3Enable,
  // web3FromAddress,
  // web3ListRpcProviders,
  // web3UseRpcProvider
} from '@polkadot/extension-dapp';
import { encodeAddress } from '@polkadot/keyring';

import background from "./img/background.jpg";
import background2 from "./img/background_split.jpg";
// import background3 from "./img/background3.jpg";
import topbar from "./img/bar.png";
// import menuicon from "./img/menu.png";
import walleticon from "./img/wallet.png";
import playbutton from "./img/play.png";
import twitter from "./img/twitter.png";
import telegram from "./img/tg.png";
import singular from "./img/rmrk.png";

const API_ROOT = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';

let unsubscribe;

class App extends React.Component {

  constructor(props) {
    super(props);

    this.setSelectedAddress = this.setSelectedAddress.bind(this);
    this.initPolka = this.initPolka.bind(this);
    this.onPlayBtn = this.onPlayBtn.bind(this);

    this.state = {
      loading: true,
      polkadot: false,
      addresses: [],
      selectedAddress: '',
      allNfts: [],
      ownedNfts: [],
      ownedNftsFlat: [],
      goToSlide: 0,
      isDialogShown: false
    }
  }

  componentDidMount() {
    fetch(API_ROOT + '/api/nfts').then(nfts => nfts.json()).then(nfts => {
      let slides = [];
      nfts.forEach((nft, i) => {
        slides.push(
          {
            key: i.toString(),
            content: <img width="328" height="470" src={API_ROOT + nft.cacheImage} alt={i} />
          });
      });
      slides = slides.map((slide, index) => {
        return {
          ...slide,
          onClick: () => {
            this.setState({ goToSlide: index });
          }
        };
      });
      this.setState({
        allNfts: slides,
        loading: false
      });
    }).catch(err => {
      console.error(err);
    });
    this.initPolka();
  }

  async onPlayBtn()
  {
    if (!this.state.polkadot) {
      toaster.warning('Please connect your wallet via polkadot{js} extension', {id: 'forbidden-action', hasCloseButton: true })
      this.setState({
        isDialogShown: true
      });
      return;
    }

    if (!this.state.selectedAddress) {
      if (!this.state.addresses || this.state.addresses.length === 0) {
        this.setState({
          isDialogShown: true
        });
      } else {
        toaster.warning('Please select address to fetch your NFTs', {id: 'forbidden-action', hasCloseButton: true })
      }
      return;
    }

    if (this.state.ownedNfts && this.state.ownedNfts.length > 0){
      // toaster.success('You are good to go! Stay tuned, battles will become available soon!', {id: 'forbidden-action', hasCloseButton: true });
      window.localStorage.setItem('_nftdatatemp', window.location.origin + this.state.ownedNftsFlat[0].url);//JSON.stringify(this.state.ownedNftsFlat)
      window.location.href = '/battles/';
    } else {
      // toaster.success('Stay tuned, battles will become available soon! Meanwhile, you can buy some NFTs on Singular to be ready for it!', {id: 'forbidden-action', hasCloseButton: true });
      this.setState({
        isDialogShown: true
      });
    }
  }

  async initPolka()
  {
    const extensions = await web3Enable('Crypto Samas');

    if (extensions.length === 0) {
      this.setState({
        polkadot: false
      });
      return;
    } else {
      this.setState({
        polkadot: true
      });
    }

    unsubscribe = await web3AccountsSubscribe(async ( injectedAccounts ) => {
        let ads = [];
        injectedAccounts.map(( account ) => {
          ads.push({name: account.meta.name, address: encodeAddress(account.address, 2)});
        })
        this.setState({
          addresses: ads
        });
     });
  }

  setSelectedAddress(v) {
    this.setState({
      selectedAddress: v,
      loading: true
    })
    const chosenAddress = this.state.addresses.filter(a => {
      return a.name === v
    })
    fetch(API_ROOT + '/api/nfts/owned?address=' + chosenAddress[0].address).then(nfts => nfts.json()).then(nfts => {
      if (nfts.length == 0) {
        toaster.warning('There is no Crypto Samas NFTs associated with this address', {id: 'forbidden-action', hasCloseButton: true })
        this.setState({
          loading: false,
          ownedNfts: [],
          isDialogShown: true
        });
        return;
      }
      let nftsFlat = [];
      let slides = [];
      nfts.forEach((nft, i) => {
        slides.push(
          {
            key: i.toString(),
            content: <img width="328" height="470" src={API_ROOT + nft.cacheImage} alt={i} />
          });
        nftsFlat.push({id: nft.id, url: nft.cacheImage});
      });
      slides = slides.map((slide, index) => {
        return {
          ...slide,
          onClick: () => {
            this.setState({ goToSlide: index });
          }
        };
      });
      this.setState({
        ownedNfts: slides,
        ownedNftsFlat: nftsFlat,
        loading: false
      });
    }).catch(err => {
      console.error(err);
    });
  }

  componentWillUnmount() {
    unsubscribe && unsubscribe();
  }

  render() {
    return (
      <div>
          <div className="Background" style={{ backgroundImage: `url(${background})` }}>
          <BrowserView>
            <div className="topnav" style={{ backgroundImage: `url(${topbar})` }}>
                <div className="alignLeft">
                </div>
                <div className="alignCenter">
                  <p>Welcome to Ku-Island</p>
                </div>
                <div className="alignRight">
                    {
                      this.state.addresses.length > 0
                      ?
                      <SelectMenu
                        title="Select name"
                        options={this.state.addresses.map((a) => ({ label: a.name + ` (${a.address.substring(0, 7)}...)`, value: a.name }))}
                        selected={this.state.selectedAddress}
                        hasFilter={false}
                        hasTitle={false}
                        closeOnSelect={true}
                        onSelect={(item) => this.setSelectedAddress(item.value)}
                      >
                        <button className="btn">
                          <div id="btn_container"><img src={walleticon}/></div>
                          {
                            this.state.selectedAddress ?
                            <div className="connected">
                            <span>{this.state.selectedAddress}</span>
                            </div>
                            :
                            <span>{'Select address'}</span>
                          }
                        </button>
                      </SelectMenu>
                      :
                      <button className="btn" onClick={async ()=>{
                        await this.initPolka();
                        if (!this.state.polkadot) {
                          window.open("https://polkadot.js.org/extension/", "_blank");
                        }
                      }}>
                        <div id="btn_container"><img src={walleticon}/></div>
                        <span>Connect wallet</span>
                      </button>
                    }
                </div>
              </div>
            </BrowserView>
            <MobileView>
            <div className="topnav" style={{ backgroundImage: `url(${topbar})` }}>
              <div className="alignCenterMobile">
                <p>Welcome to Ku-Island</p>
              </div>
            </div>
            </MobileView>
            <BrowserView>
            <div className="CarouselRoot">
              <Carousel slides={this.state.ownedNfts && this.state.ownedNfts.length > 0 ? this.state.ownedNfts : this.state.allNfts} showNavigation={this.state.ownedNfts && this.state.ownedNfts.length > 0 ? (this.state.ownedNfts.length > 1 ? true : false) : (this.state.allNfts.length > 1 ? true : false)} goToSlide={this.state.goToSlide} />
            </div>
            <button className="PlayButton" onClick={()=>this.onPlayBtn()}>
              <img src={playbutton}/>
            </button>
            </BrowserView>
          </div>
          <BrowserView>
          <div className="Background2" style={{ backgroundImage: `url(${background2})` }}>
            <div className="topnav2" style={{ backgroundImage: `url(${topbar})` }}></div>
            <div className="about">
            <h2>
            The Crypto Samas Plot
            </h2>
            <p>
            In the middle of the ocean lies the Ku Island where the Samas live.<br/>
            The special thing about it is that each Sama lives individually and brings his own abilities with him, but they still harmonize very well as a tribe on the island. One day they were attacked by devilish monsters who were trying to steal the Sama's eggs. The Samas organized a battle tournament to find the strongest Samas to protect the island and the eggs.
            </p>
            </div>
            <div className="social">
            <div className="srow">
            <a href="https://t.me/cryptosamas" target="_blank"><div className="sba">Telegram</div><img className="socialbtn" src={telegram}/></a>
            </div>
            <div className="srow2">
            <a href="https://twitter.com/CryptoSamas" target="_blank"><div className="sba">Twitter</div><img className="socialbtn" src={twitter}/></a>
            </div>
            <div className="srow3">
            <a href="https://singular.rmrk.app/collections/ca90f519f18bc2a62c-SAMAS" target="_blank"><div className="sba">Explore</div><img className="socialbtn" src={singular}/></a>
            </div>
            </div>
          </div>
          <Dialog
            isShown={this.state.isDialogShown}
            title="Demo mode"
            onCloseComplete={() => {
              console.log('onCloseComplete')
              this.setState({
                isDialogShown: false
              });
            }}
            onConfirm={()=>{
              this.setState({
                isDialogShown: true
              });
              // toaster.success('Get ready!', {id: 'forbidden-action', hasCloseButton: true });
              window.localStorage.setItem('_nftdatatemp', '');
              window.location.href = '/battles/';
            }}
            confirmLabel="Play demo"
          >
            Seems like you don't own any Crypto Samas NFT to play with yet. Wanna play in demo mode instead?
          </Dialog>
          </BrowserView>
          <MobileView>
          <div className="Welcome">
            <p>Currently, Crypto Samas battles are available only on desktop</p>
            <div className="msb">
              <div className="mobilesocialbtn">
              <a href="https://t.me/cryptosamas" target="_blank"><div className="sba">Telegram</div><img className="socialbtn" src={telegram}/></a>
              </div>
              <div className="mobilesocialbtn">
              <a href="https://twitter.com/CryptoSamas" target="_blank"><div className="sba">Twitter</div><img className="socialbtn" src={twitter}/></a>
              </div>
              <div className="mobilesocialbtn">
              <a href="https://singular.rmrk.app/collections/ca90f519f18bc2a62c-SAMAS" target="_blank"><div className="sba">Explore</div><img className="socialbtn" src={singular}/></a>
              </div>
            </div>
          </div>
          </MobileView>
        {this.state.loading ? <div><div className="fade-wrapper"></div><div className="spinner"></div></div> : <div className='fader'></div>}
      </div>
    );
  }
}

export default App;
