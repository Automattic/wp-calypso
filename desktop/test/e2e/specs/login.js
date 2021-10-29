/* eslint-disable no-console, import/no-nodejs-modules */
const { createWriteStream } = require( 'fs' );
const { mkdir } = require( 'fs/promises' );
const path = require( 'path' );
const { _electron: electron } = require( 'playwright' );

// Linux:
const APP_PATH = path.join( __dirname, '../../../release/linux-unpacked/wpcom' );
// Mac:
// const APP_PATH = path.join(
// 	__dirname,
// 	'../../../',
// 	'release',
// 	'mac',
// 	'WordPress.com.app',
// 	'Contents',
// 	'MacOS',
// 	'WordPress.com'
// );
const CONSOLE_PATH = path.join( __dirname, '../results/console.log' );
const SCREENSHOT_PATH = path.join( __dirname, '../results/screenshot.png' );
const HAR_PATH = path.join( __dirname, '../results/network.har' );
const VIDEO_PATH = path.join( __dirname, '../results/video.webm' );

const timestamp = new Date().toJSON().replace( /:/g, '-' );
const appLogPath = path.resolve( __dirname, '..', 'results', `app-${ timestamp }.log` );

function cleanBaseURL( url ) {
	if ( url.endsWith( '/' ) ) {
		return cleanBaseURL( url.replace( /\/$/, '' ) );
	}
	return url;
}

describe( 'User Can log in', () => {
	jest.setTimeout( 60000 );

	let mainWindow;
	let electronApp;
	let consoleStream;

	beforeAll( async () => {
		await mkdir( path.dirname( CONSOLE_PATH ), { recursive: true } );
		consoleStream = await createWriteStream( CONSOLE_PATH );
		const parentEnv = process.env;

		electronApp = await electron.launch( {
			executablePath: APP_PATH,
			args: [ '--disable-http-cache', '--start-maximized' ],
			recordVideo: {
				dir: path.dirname( SCREENSHOT_PATH ),
			},
			timeout: 0,
			recordHar: {
				path: HAR_PATH,
			},
			// FIXME: For some reason env variables are not visible from the Electron application. Strange. 🤔
			env: {
				WP_DEBUG_LOG: `${ appLogPath }`, // This will override logging path from the Electron main process.
				// Ensure other CI-specific overrides (such as disabling the auto-updater)
				DEBUG: true,
				CI: true,
				...parentEnv,
				...( process.env.WP_DESKTOP_BASE_URL !== undefined && {
					WP_DESKTOP_BASE_URL: cleanBaseURL( process.env.WP_DESKTOP_BASE_URL ),
				} ),
			},
		} );
		electronApp.context().tracing.start( { screenshots: true } );

		mainWindow = await electronApp.firstWindow();
		mainWindow.on( 'console', ( data ) =>
			consoleStream.write( `${ new Date().toUTCString() } [${ data.type() }] ${ data.text() }\n` )
		);

		console.log( 'Main Window:' );
		console.log( 'Title: ', await mainWindow.title() );
		console.log( 'URL: ', await mainWindow.url() );
	} );

	// eslint-disable-next-line jest/expect-expect
	it( 'Log in', async function () {
		await mainWindow.fill( '#usernameOrEmail', process.env.E2EGUTENBERGUSER );
		await mainWindow.keyboard.press( 'Enter' );
		await mainWindow.fill( '#password', process.env.E2EPASSWORD );

		// Wait for response from the Login endpoint.
		const [ response ] = await Promise.all( [
			mainWindow.waitForResponse( '**/wp-login.php?action=login-endpoint' ),
			mainWindow.click( 'button:has-text("Log In")' ),
		] );

		// If the account credentials are rejected, throw an error containing the text of
		// the validation error.
		// Credentaials can be rejected for any number of reasons:
		// 	- closed account
		//	- wrong password
		if ( response.status() === 400 ) {
			throw new Error(
				await mainWindow
					.waitForSelector( 'div.is-error' )
					.then( ( element ) => element.innerText() )
			);
		}

		expect( response.status() ).toBe( 200 );
	} );

	afterAll( async () => {
		if ( consoleStream ) {
			consoleStream.end();
		}

		if ( mainWindow ) {
			await mainWindow.screenshot( { path: SCREENSHOT_PATH } );
			const video = mainWindow.video();
			if ( video ) {
				console.log( await video.path() );
				console.log( await video.saveAs( VIDEO_PATH ) );
			}
		}

		if ( electronApp ) {
			try {
				await electronApp.context().close();
				await electronApp.close();
			} catch {}
		}
	} );
} );
