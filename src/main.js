import program from 'commander';
import HTTP from 'q-io/http';
import NATS from 'nats';

export function main() {

	program
		.version(require('../package.json').version)
		.option('-s, --server <uri>', 'specify NATS uri')
		.option('-t, --token <token>', 'specify forecast.io token')
		.option('-v, --verbose', 'verbose mode')
		.parse(process.argv);

	var nats = NATS.connect(program.server);

	function log(subject, msg) { 
		if (!program.verbose) return;
		console.log('[' + subject + '] ' + msg);
	}

	async function getWeather(location) { 
		var resp = await HTTP.request({
			url: "https://api.forecast.io/forecast/"
				+ program.token
				+ "/"
				+ location, 
			method: 'GET'
		});
		var body = await resp.body.read();
		return JSON.parse(body).currently; 
	}

	nats.on('connect', () => {
		log('NATS', 'connect')
		nats.subscribe('weather.get', async (msg, reply) => {
			log('REQUEST WEATHER', msg);
			var data = await getWeather(msg);
			nats.publish(reply, JSON.stringify(data));
		});
		nats.subscribe('weather.temp.get', async (msg, reply) => {
			log('REQUEST TEMP', msg);
			var data = await getWeather(msg);
			nats.publish(reply, data.temperature);
		});
	});
	nats.on('reconnecting', () => {
		log('NATS', 'reconnecting');
	});
	nats.on('disconnect', () => {
		log('NATS', 'disconnect');
	});
}
