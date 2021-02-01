import "regenerator-runtime/runtime";
import "./lib/cropper.min";
import "./lib/pica.min";
import "./lib/underscore-min";
import "./lib/gun";
import "./lib/open";
import "./lib/sea";
import "./lib/nts";
import "./lib/radix";
import "./lib/radisk";
import "./lib/store";
import "./lib/rindexed";
import "./lib/iris";
import "./lib/emoji-button";
import "./lib/Autolinker.min";
import "./lib/qrcode.min";
import "./lib/qr.zxing";
import "./lib/webtorrent.min";
import 'react-virtualized/styles.css';

import { render } from "react-dom";
import { Router, route } from "./lib/preact-router.es";
import { createHashHistory } from "./lib/history.production.min";
import { Component } from "react";
import { Link } from "./lib/preact.match";

import Helpers from "./Helpers";
import { html } from "./Helpers";
import QRScanner from "./QRScanner";
import PeerManager from "./PeerManager";
import Session from "./Session";
import PublicMessages from "./PublicMessages";
import { translate as t } from "./Translation";

import Settings from "./components/Settings";
import LogoutConfirmation from "./components/LogoutConfirmation";
import ChatView from "./components/ChatView";
import StoreView from "./components/StoreView";
import CheckoutView from "./components/CheckoutView";
import ProductView from "./components/ProductView";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MessageView from "./components/MessageView";
import FollowsView from "./components/FollowsView";
import FeedView from "./components/FeedView";
import AboutView from "./components/AboutView";
import ExplorerView from "./components/ExplorerView";
import VideoCall from "./components/VideoCall";
import Identicon from "./components/Identicon";
import State from "./State";
import Icons from "./Icons";
import $ from 'jquery'

const userAgent = navigator.userAgent.toLowerCase();
const isElectron = userAgent.indexOf(" electron/") > -1;
if (!isElectron && "serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("../serviceworker.js").catch(function (err) {
      // registration failed :(
      console.log("ServiceWorker registration failed: ", err);
    });
  });
}

Session.init({ autologin: window.location.hash.length > 2 });
PeerManager.init();
PublicMessages.init();

Helpers.checkColorScheme();

const APPLICATIONS = [
  // TODO: move editable shortcuts to localState gun
  { url: "/", text: t("home"), icon: Icons.home },
  { url: "/chat", text: t("messages"), icon: Icons.chat },
  { url: "/settings", text: t("settings"), icon: Icons.settings },
  { url: "/explorer", text: t("explorer"), icon: Icons.folder },
  { url: "/about", text: t("about") },
];

const MenuView = (props) => {
  const pub = Session.getPubKey();
  return html`
    <div class="application-list">
      <div class="visible-xs-block">
        <${Link}
          onClick=${() => props.toggleMenu(false)}
          activeClassName="active"
          href="/profile/${pub}"
        >
          <span class="icon"><${Identicon} str=${pub} width="40" /></span>
          <span class="text" style="font-size: 1.2em;border:0;margin-left: 7px;"
            ><iris-text user="${pub}" path="profile/name" editable="false"
          /></span>
        <//>
        <br /><br />
      </div>
      ${APPLICATIONS.map((a) => {
        if (a.url) {
          return html` <${a.native ? "a" : Link}
            onClick=${() => props.toggleMenu(false)}
            activeClassName="active"
            href=${a.url}
          >
            <span class="icon">${a.icon || Icons.circle}</span>
            <span class="text">${a.text}</span>
          <//>`;
        } else {
          return html`<br /><br />`;
        }
      })}
    </div>
  `;
};

class Main extends Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    State.local.get("loggedIn").on((loggedIn) => this.setState({ loggedIn }));
  }

  handleRoute(e) {
    document.title = "Iris";
    let activeRoute = e.url;
    if (!activeRoute && window.location.hash) {
      return route(window.location.hash.replace("#", "")); // bubblegum fix back navigation
    }
    State.local.get("activeRoute").put(activeRoute);
    QRScanner.cleanupScanner();
  }

  onClickOverlay(e) {
    if (this.state.showMenu) {
      this.setState({ showMenu: false });
    }
  }

  toggleMenu(show) {
    this.setState({
      showMenu: typeof show === "undefined" ? !this.state.showMenu : show,
    });
  }

  render() {
    let content = "";
    if (this.state.loggedIn || window.location.hash.length <= 2) {
      content = this.state.loggedIn
        ? html`
        <${Header} toggleMenu=${(show) => this.toggleMenu(show)}/>
        <section class="main ${
          this.state.showMenu ? "menu-visible-xs" : ""
        }" style="flex-direction: row;">
          <${MenuView} toggleMenu=${(show) => this.toggleMenu(show)}/>
          <div class="overlay" onClick=${(e) => this.onClickOverlay(e)}></div>
          <div class="view-area">
            <${Router} history=${createHashHistory()} onChange=${(e) =>
            this.handleRoute(e)}>
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
      `
        : html`<${Login} />`;
    }
    return html` <div id="main-content">${content}</div> `;
  }
}

render(html`<${Main} />`, document.getElementById("root"));

$("body").css("opacity", 1); // use opacity because setting focus on display: none elements fails

Helpers.showConsoleWarning();

$(window).resize(() => {
  // if resizing up from mobile size menu view
  if ($(window).width() > 565 && $(".main-view:visible").length === 0) {
    route("/");
  }
});
