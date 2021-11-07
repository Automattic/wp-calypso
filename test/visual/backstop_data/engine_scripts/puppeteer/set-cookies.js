const fs = require( 'fs' ).promises;

// Remove all the logging statements. They are too noisy.
console.log = () => {};

module.exports = async ( page ) => {
	const cookiesString = await fs.readFile( './test/visual/cookies/cookies.json' );
	const cookies = JSON.parse( cookiesString );
	await page.setCookie( ...cookies );
};
