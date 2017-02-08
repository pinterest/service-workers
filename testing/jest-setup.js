// Make promises synchronous
global.Promise = require('./sync-promise');
const Subscription = require('./fixtures').Subscription;
const Cache = require('./fixtures').Cache;

const noop = () => {};

global.__TEST_MODE__ = true;
global.fetch = jest.fn(() => Promise.resolve());

global.self = {
  addEventListener: jest.fn(),
  registration: {
    getNotifications: jest.fn(() => Promise.resolve([])),
    showNotification: jest.fn(() => Promise.resolve()),
    pushManager: {
      getSubscription: jest.fn(() => Promise.resolve(Subscription())),
    },
  },
};

global.navigator = {
  serviceWorker: {
    get ready() {
      return Promise.resolve(navigator.serviceWorker);
    },
    pushManager: {
      subscribe: jest.fn(),
    },
    register: jest.fn(),
  },
};

global.caches = {
  delete: jest.fn(() => Promise.resolve()),
  keys: jest.fn(() => Promise.resolve()),
  open: jest.fn(name => Promise.resolve(Cache())),
};

global.clients = {
  claim: jest.fn(() => Promise.resolve()),
  matchAll: jest.fn(),
  openWindow: jest.fn(),
};

global.logger = {
  log: noop,
  warn: noop,
  error: noop,
};
