import { render } from './lib/preact.js';
import { Router, route } from './lib/preact-router.es.js';
import { createHashHistory } from './lib/history.production.min.js';
import { Component } from './lib/preact.js';
import { Link } from './lib/preact.match.js';

import Helpers from './Helpers.js';
import { html } from './Helpers.js';
import QRScanner from './QRScanner.js';
import PeerManager from './PeerManager.js';
import Session from './Session.js';
import PublicMessages from './PublicMessages.js';
import { translate as t } from './Translation.js';

import Settings from './components/Settings.js';
import LogoutConfirmation from './components/LogoutConfirmation.js';
import ChatView from './components/ChatView.js';
import StoreView from './components/StoreView.js';
import CheckoutView from './components/CheckoutView.js';
import ProductView from './components/ProductView.js';
import Login from './components/Login.js';
import Profile from './components/Profile.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import MessageView from './components/MessageView.js';
import FollowsView from './components/FollowsView.js';
import FeedView from './components/FeedView.js';
import AboutView from './components/AboutView.js';
import ExplorerView from './components/ExplorerView.js';
import VideoCall from './components/VideoCall.js';
import Identicon from './components/Identicon.js';
import State from './State.js';
import Icons from './Icons.js';

const userAgent = navigator.userAgent.toLowerCase();
const isElectron = (userAgent.indexOf(' electron/') > -1);
if (!isElectron && ('serviceWorker' in navigator)) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('serviceworker.js')
    .catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

State.init();
Session.init({autologin: window.location.hash.length > 2});
PeerManager.init();
PublicMessages.init();

Helpers.checkColorScheme();

const APPLICATIONS = [ // TODO: move editable shortcuts to localState gun
  {url: '/', text: t('home'), icon: Icons.home},
  {url: '/chat', text: t('messages'), icon: Icons.chat},
  {url: '/settings', text: t('settings'), icon: Icons.settings},
  {url: '/explorer', text: t('explorer'), icon: Icons.folder},
  {url: '/about', text: t('about')},
];

const MenuView = props => {
  const pub = Session.getPubKey();
  return html`
    <div class="application-list">
      <div class="visible-xs-block">
        <${Link} onClick=${() => props.toggleMenu(false)} activeClassName="active" href="/profile/${pub}">
          <span class="icon"><${Identicon} str=${pub} width=40/></span>
          <span class="text" style="font-size: 1.2em;border:0;margin-left: 7px;"><iris-text user="${pub}" path="profile/name" editable="false"/></span>
        <//>
        <br/><br/>
      </div>
      ${APPLICATIONS.map(a => {
        if (a.url) {
          return html`
            <${a.native ? 'a' : Link} onClick=${() => props.toggleMenu(false)} activeClassName="active" href=${a.url}>
              <span class="icon">${a.icon || Icons.circle}</span>
              <span class="text">${a.text}</span>
            <//>`;
        } else {
          return html`<br/><br/>`;
        }
      })}
    </div>
  `;
};

class Main extends Component {
  componentDidMount() {
    State.local.get('loggedIn').on(loggedIn => this.setState({loggedIn}));
  }

  handleRoute(e) {
    document.title = 'Iris';
    let activeRoute = e.url;
    if (!activeRoute && window.location.hash) {
      return route(window.location.hash.replace('#', '')); // bubblegum fix back navigation
    }
    State.local.get('activeRoute').put(activeRoute);
    QRScanner.cleanupScanner();
  }

  onClickOverlay(e) {
    if (this.state.showMenu) {
      this.setState({showMenu: false});
    }
  }

  toggleMenu(show) {
    this.setState({showMenu: typeof show === 'undefined' ? !this.state.showMenu : show});
  }

  render() {
    let content = '';
    if (this.state.loggedIn || window.location.hash.length <= 2) {
      content = this.state.loggedIn ? html`
        <${Header} toggleMenu=${show => this.toggleMenu(show)}/>
        <section class="main ${this.state.showMenu ? 'menu-visible-xs' : ''}" style="flex-direction: row;">
          <${MenuView} toggleMenu=${show => this.toggleMenu(show)}/>
          <div class="overlay" onClick=${e => this.onClickOverlay(e)}></div>
          <div class="view-area">
            <${Router} history=${createHashHistory()} onChange=${e => this.handleRoute(e)}>
              <${FeedView} path="/"/>
              <${FeedView} path="/feed"/>
              <${Login} path="/login"/>
              <${ChatView} path="/chat/:id?"/>
              <${MessageView} path="/post/:hash"/>
              <${AboutView} path="/about"/>
              <${Settings} path="/settings" showSwitchAccount=${true}/>
              <${LogoutConfirmation} path="/logout"/>
              <${Profile.Profile} path="/profile/:id?"/>
              <${StoreView} path="/store/:store?"/>
              <${CheckoutView} path="/checkout/:store"/>
              <${ProductView} path="/product/:product/:store"/>
              <${ProductView} path="/product/new" store=Session.getPubKey()/>
              <${ExplorerView} path="/explorer/:node"/>
              <${ExplorerView} path="/explorer"/>
              <${FollowsView} path="/follows/:id"/>
              <${FollowsView} followers=${true} path="/followers/:id"/>
            </${Router}>
          </div>
        </section>
        <${Footer}/>
        <${VideoCall}/>
      ` : html`<${Login}/>`;
    }
    return html`
      <div id="main-content">
        ${content}
      </div>
    `;
  }
}

render(html`<${Main}/>`, document.body);

$('body').css('opacity', 1); // use opacity because setting focus on display: none elements fails

Helpers.showConsoleWarning();

$(window).resize(() => { // if resizing up from mobile size menu view
  if ($(window).width() > 565 && $('.main-view:visible').length === 0) {
    route('/');
  }
});
