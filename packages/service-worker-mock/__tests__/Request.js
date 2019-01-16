const makeServiceWorkerEnv = require('../index');
const NodeURL = require('url').URL;
const DomURL = require('dom-urls');

describe('Request', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv());
    jest.resetModules();
  });

  it('takes a string URL only', () => {
    const stringUrl = 'http://test.com/resource.html';
    const req = new Request(stringUrl);

    expect(req.url).toEqual(stringUrl);
  });

  it('takes a DOM URL instance only', () => {
    const stringUrl = 'http://test.com/resource.html';
    const domUrl = new DomURL(stringUrl);
    const req = new Request(domUrl);

    expect(req.url).toEqual(stringUrl);
  });

  it('takes a Node URL instance only', () => {
    const stringUrl = 'http://test.com/resource.html';
    const domUrl = new NodeURL(stringUrl);
    const req = new Request(domUrl);

    expect(req.url).toEqual(stringUrl);
  });


  it('takes a Request instance only', () => {
    const stringUrl = 'http://test.com/resource.html';
    const reqInstance = new Request(stringUrl);
    const req = new Request(reqInstance);

    expect(req.url).toEqual(stringUrl);
  });

  it('overrides Request properties with options', async () => {
    const stringUrl = 'http://test.com/resource.html';
    const reqInstance = new Request(stringUrl);
    const options = {
      body: 'override body',
      credentials: 'override-credentials',
      headers: {
        'x-override': 'override value'
      },
      method: 'OMY',
      mode: 'no-mode'
    };
    const req = new Request(reqInstance, options);

    expect(req.url).toEqual(stringUrl);
    expect(await req.text()).toEqual(options.body);
    expect(req.credentials).toEqual(options.credentials);
    expect(req.method).toEqual(options.method);
    expect(req.mode).toEqual(options.mode);
    expect(req.headers.get('x-override')).toEqual('override value');
  });

  it('can be cloned with method, mode and headers', () => {
    const stringUrl = 'http://test.com/resource.html';
    const originalReq = new Request(stringUrl, {
      headers: {
        'X-Custom': 'custom-value'
      }
    });
    const req = originalReq.clone();

    expect(req.url).toEqual(stringUrl);
    expect(req.mode).toEqual(originalReq.mode);
    expect(req.method).toEqual(originalReq.method);
    expect(req.headers.get('X-Custom')).toEqual('custom-value');
  });

  it('takes a string body', async () => {
    const stringUrl = 'http://test.com/resource.html';
    const reqInstance = new Request(stringUrl, {
      body: 'content'
    });
    const req = new Request(reqInstance);

    expect(await req.text()).toEqual('content');
  });
});