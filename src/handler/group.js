import _ from "lodash";
import Promise from "bluebird";

const HANDLERS = {};

export default class GroupHandler {

  static exit() {
    console.log("groupHandler.exit");
    if (!GroupHandler.exiting) {
      const exiting = Promise.all(_.map(HANDLERS, (h) => h.flush()));
      GroupHandler.exiting = exiting;
      return exiting;
    }
    return Promise.resolve([]);
  }

  static getHandler(args) {
    const name = args.ns + args.ship.id;
    return HANDLERS[name] = HANDLERS[name] || new GroupHandler(args); // eslint-disable-line no-return-assign
  }

  constructor({ ns = "", ship, hull, options = {} }) {
    this.ns = ns;
    this.ship = ship;
    this.hull = hull;
    this.messages = [];
    this.options = options;

    this.flushLater = _.throttle(this.flush.bind(this), this.options.throttle);
    return this;
  }

  setCallback(callback) {
    this.callback = callback;
    return this;
  }

  add(message) {
    this.messages.push(message);
    this.hull.client.logger.info("groupHandler.added", this.messages.length);
    const { maxSize } = this.options;
    if (this.messages.length >= maxSize) {
      this.flush();
    } else {
      this.flushLater();
    }
    return Promise.resolve("ok");
  }

  flush() {
    const messages = this.messages;
    this.hull.client.logger.info("groupHandler.flush", messages.length);
    this.messages = [];
    return this.callback(messages)
      .then(() => {
        this.hull.client.logger.info("groupHandler.flush.sucess");
      }, (err) => {
        console.error(err);
        this.hull.client.logger.error("groupHandler.flush.error", err);
      });
  }
}
