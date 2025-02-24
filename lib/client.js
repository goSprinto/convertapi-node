'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _utils = require('./utils');

var _upload_result = require('./upload_result');

var _upload_result2 = _interopRequireDefault(_upload_result);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Client {
  constructor(api) {
    this.api = api;
    this.defaultHeader = {
      'User-Agent': api.userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    };
    this.httpsAgent = new _https2.default.Agent({ keepAlive: api.keepAlive });
  }

  get(path, params = {}, timeout = null) {
    const options = this.buildOptions({
      method: 'get',
      url: this.url(path),
      params,
      timeout: timeout * 1000
    });

    return (0, _axios2.default)(options).then(response => response.data).catch(error => Client.handleError(error));
  }

  post(path, params, timeout = null) {
    const options = this.buildOptions({
      method: 'post',
      url: this.url(path),
      data: (0, _utils.buildQueryString)(params),
      timeout: timeout * 1000
    });

    return (0, _axios2.default)(options).then(response => response.data).catch(error => Client.handleError(error));
  }

  download(url, path) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const options = _this.buildOptions({
        url,
        timeout: _this.api.downloadTimeout * 1000,
        responseType: 'stream'
      });

      const response = yield (0, _axios2.default)(options).catch(function (error) {
        return Client.handleError(error);
      });

      const writer = _fs2.default.createWriteStream(path);

      response.data.pipe(writer);

      return new Promise(function (resolve, reject) {
        writer.on('finish', function () {
          resolve(path);
        });

        writer.on('error', function (error) {
          reject(new _error2.default(error));
        });

        response.data.on('error', function (error) {
          reject(new _error2.default(error));
        });
      });
    })();
  }

  upload(stream, fileName) {
    const encodedFileName = (0, _utils.encodeFileName)(fileName);

    const headers = Object.assign({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFileName}`
    }, this.defaultHeader);

    const options = this.buildOptions({
      method: 'post',
      url: this.url('upload'),
      headers,
      data: stream,
      timeout: this.api.uploadTimeout * 1000
    });

    return (0, _axios2.default)(options).then(response => new _upload_result2.default(response.data)).catch(error => Client.handleError(error));
  }

  url(path) {
    return `${this.api.baseUri}${path}?secret=${this.api.secret}`;
  }

  buildOptions(options) {
    return Object.assign({
      headers: this.defaultHeader,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      proxy: this.api.proxy,
      httpsAgent: this.httpsAgent
    }, options);
  }

  static handleError(error) {
    let data;

    if (error.response && error.response.data) {
      data = error.response.data;
    }

    throw new _error2.default(error, data);
  }
}
exports.default = Client;