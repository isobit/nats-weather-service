'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.main = main;

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _http = require('q-io/http');

var _http2 = _interopRequireDefault(_http);

var _nats = require('nats');

var _nats2 = _interopRequireDefault(_nats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

function main() {
	_commander2.default.version('0.0.1').option('-s, --server <uri>', 'specify NATS uri').option('-v, --verbose', 'verbose mode').parse(process.argv);

	var nats = _nats2.default.connect(_commander2.default.server);

	function log(subject, msg) {
		if (!_commander2.default.verbose) return;
		console.log('[' + subject + '] ' + msg);
	}

	var getWeather = (function () {
		var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(location) {
			var resp, body;
			return regeneratorRuntime.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							_context.next = 2;
							return _http2.default.request({
								url: "https://api.forecast.io/forecast/dac468db36d739ed62504c62d3e8c595/" + location,
								method: 'GET'
							});

						case 2:
							resp = _context.sent;
							_context.next = 5;
							return resp.body.read();

						case 5:
							body = _context.sent;
							return _context.abrupt('return', JSON.parse(body).currently);

						case 7:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		return function getWeather(_x) {
			return ref.apply(this, arguments);
		};
	})();

	nats.on('connect', function () {
		log('NATS', 'connect');
		nats.subscribe('weather.get', (function () {
			var _this = this;

			var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(msg, reply) {
				var data;
				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								log('REQUEST WEATHER', msg);
								_context2.next = 3;
								return getWeather(msg);

							case 3:
								data = _context2.sent;

								nats.publish(reply, JSON.stringify(data));

							case 5:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, _this);
			}));

			return function (_x2, _x3) {
				return ref.apply(this, arguments);
			};
		})());
		nats.subscribe('weather.temp.get', (function () {
			var _this2 = this;

			var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(msg, reply) {
				var data;
				return regeneratorRuntime.wrap(function _callee3$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
								log('REQUEST TEMP', msg);
								_context3.next = 3;
								return getWeather(msg);

							case 3:
								data = _context3.sent;

								nats.publish(reply, data.temperature);

							case 5:
							case 'end':
								return _context3.stop();
						}
					}
				}, _callee3, _this2);
			}));

			return function (_x4, _x5) {
				return ref.apply(this, arguments);
			};
		})());
	});
	nats.on('reconnecting', function () {
		log('NATS', 'reconnecting');
	});
	nats.on('disconnect', function () {
		log('NATS', 'disconnect');
	});
}