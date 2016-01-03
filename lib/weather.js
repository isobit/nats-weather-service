'use strict';

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _nats = require('nats');

var _nats2 = _interopRequireDefault(_nats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

require('babel-polyfill');

var nats = _nats2.default.connect("nats://admin:LBuDwnwLRt4b@asgard.isobit.io:4222");

var getWeather = (function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
		var resp;
		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_context.next = 2;
						return _axios2.default.get("https://api.forecast.io/forecast/dac468db36d739ed62504c62d3e8c595/44.9810,-93.2338");

					case 2:
						resp = _context.sent;
						return _context.abrupt('return', resp.data.currently);

					case 4:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function getWeather() {
		return ref.apply(this, arguments);
	};
})();

nats.subscribe('weather.get', (function () {
	var _this = this;

	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(msg, reply) {
		var data;
		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_context2.next = 2;
						return getWeather();

					case 2:
						data = _context2.sent;

						nats.publish(reply, JSON.stringify(data));

					case 4:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, _this);
	}));

	return function (_x, _x2) {
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
						_context3.next = 2;
						return getWeather();

					case 2:
						data = _context3.sent;

						nats.publish(reply, data.temperature);

					case 4:
					case 'end':
						return _context3.stop();
				}
			}
		}, _callee3, _this2);
	}));

	return function (_x3, _x4) {
		return ref.apply(this, arguments);
	};
})());