// eslint-disable-next-line import/no-nodejs-modules
const fs = require( 'fs' ).promises;

// Remove all the logging statements. They are too noisy.
// eslint-disable-next-line no-console
console.log = () => {};

module.exports = async ( page ) => {
	const cookiesString = await fs.readFile( './test/visual/cookies/cookies.json' );
	const cookies = JSON.parse( cookiesString );
	await page.setCookie( ...cookies );
};
