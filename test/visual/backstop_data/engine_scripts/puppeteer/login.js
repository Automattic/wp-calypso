const fs = require('fs');
const path = require('path');

process.env.NODE_CONFIG_DIR = path.join(__dirname, '../../../config');
const config = require('config');
const account = config.get('visualRegressionUser');

function createDir( dir ) {
	dir = path.resolve( dir );
	if ( fs.existsSync( dir ) ) return dir;
	try {
		fs.mkdirSync( dir );
		return dir;
	} catch ( error ) {
		if ( error.code === 'ENOENT' ) {
			return createDir( path.dirname( dir ) ) && createDir( dir );
		}
		throw error;
	}
}

module.exports = async (page, scenario) => {
	await page.setCookie( {
		name: 'sensitive_pixel_option',
		value: 'no',
		domain: '.wordpress.com',
		secure: true
	} );
	await page.goto( scenario.url + '/log-in' );

	await page.waitForSelector( '.login__form-password.is-hidden' );
	await page.type( 'input[name="usernameOrEmail"]', account.username, { delay: 100 } );
	await page.click( 'button.is-primary' );

	await page.waitForTimeout(2000);
	await page.waitForSelector( '.login__form-password:not(.is-hidden)' );
	await page.type( 'input[name="password"]', account.password, { delay: 100 } );
	let pageNavigation = page.waitForNavigation();
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
