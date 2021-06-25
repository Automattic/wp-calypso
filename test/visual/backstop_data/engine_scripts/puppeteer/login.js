// eslint-disable-next-line import/no-nodejs-modules
const fs = require( 'fs' );
const path = require( 'path' );

process.env.NODE_CONFIG_DIR = path.join( __dirname, '../../../config' );
const config = require( 'config' );
const account = config.get( 'visualRegressionUser' );

// Remove all the logging statements. They are too noisy.
// eslint-disable-next-line no-console
console.log = () => {};

function createDir( dir ) {
	dir = path.resolve( dir );
	fs.mkdirSync( dir, { recursive: true } );
}

module.exports = async ( page, scenario ) => {
	await page.setCookie( {
		name: 'sensitive_pixel_option',
		value: 'no',
		domain: '.wordpress.com',
		secure: true,
	} );
	await page.goto( scenario.url + '/log-in' );

	await page.waitForSelector( '.login__form-password.is-hidden' );
	await page.type( 'input[name="usernameOrEmail"]', account.username, { delay: 100 } );
	await page.click( 'button.is-primary' );

	await page.waitForTimeout( 2000 );
	await page.waitForSelector( '.login__form-password:not(.is-hidden)' );
	await page.type( 'input[name="password"]', account.password, { delay: 100 } );
	const pageNavigation = page.waitForNavigation();
	await page.click( 'button.is-primary' );
	await pageNavigation;

	//Save Cookies
	const cookieDir = './test/visual/cookies';
	createDir( cookieDir );
	await page.goto( 'https://public-api.wordpress.com/wp-admin/' );
	const cookies = await page.cookies();
	await fs.writeFileSync( cookieDir + '/cookies.json', JSON.stringify( cookies, null, 2 ) );
	await page.goBack();
	await pageNavigation;
};
