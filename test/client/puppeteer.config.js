module.exports = {
	launch: {
		headless: process.env.PUPPETEER_HEADLESS !== 'false',
		slowMo: parseInt( process.env.PUPPETEER_SLOWMO, 10 ) || 0,
	},
};
