import PeerManager from "./PeerManager.js";
import iris from "./lib/iris";
import Gun from './lib/gun'
class State {
  constructor(publicOpts) {
    Gun.log.off = true;
    const o = Object.assign(
      {
        peers: PeerManager.getRandomPeers(),
        localStorage: false,
        retry: Infinity,
      },
      publicOpts
    );
    this.public = Gun(o);
    if (publicOpts && publicOpts.peers) {
      publicOpts.peers.forEach((url) => PeerManager.addPeer({ url }));
    }
    this.local = Gun({
      peers: [],
      file: "State.local",
      multicast: false,
      localStorage: false,
    }).get("state");
    if (iris.util.isElectron) {
      this.electron = Gun({
        peers: ["http://localhost:8768/gun"],
        file: "State.local",
        multicast: false,
        localStorage: false,
      }).get("state");
    }
    iris.util.setPublicState &&
      iris.util.setPublicState(this.public);
  }
}

export default new State();
