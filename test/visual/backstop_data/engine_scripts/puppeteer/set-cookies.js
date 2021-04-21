const fs = require('fs').promises;

module.exports = async (page, scenario, vp) => {
	const cookiesString = await fs.readFile('./test/visual/cookies/cookies.json');
	const cookies = JSON.parse(cookiesString);
	await page.setCookie(...cookies);
};
