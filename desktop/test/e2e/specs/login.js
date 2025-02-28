/* eslint-disable no-console, import/no-nodejs-modules */
const { createWriteStream } = require( 'fs' );
const { mkdir } = require( 'fs/promises' );
const path = require( 'path' );
const { _electron: electron } = require( 'playwright' );
const config = require( '../../../app/lib/config' );

let APP_PATH;

switch ( process.platform ) {
	case 'linux':
		APP_PATH = path.join( __dirname, '../../../release/linux-unpacked/wpcom' );
		break;
	case 'darwin':
		// On Apple Silicon, the output file is under a separate directory.
		if ( process.arch.includes( 'arm' ) ) {
			APP_PATH = path.join(
				__dirname,
				'../../../release/mac-arm64/WordPress.com.app/Contents/MacOS/WordPress.com'
			);
			break;
		}
		// Codepath for Intel architecture.
		APP_PATH = path.join(
			__dirname,
			'../../../release/mac/WordPress.com.app/Contents/MacOS/WordPress.com'
		);
		break;
	default:
		throw new Error( 'unsupported platform' );
}

const CONSOLE_PATH = path.join( __dirname, '../results/console.log' );
const SCREENSHOT_PATH = path.join( __dirname, '../results/screenshot.png' );
const HAR_PATH = path.join( __dirname, '../results/network.har' );
const WP_DEBUG_LOG = path.resolve( __dirname, '../results/app.log' );

const BASE_URL = process.env.WP_DESKTOP_BASE_URL?.replace( /\/$/, '' ) ?? 'https://wordpress.com';

const skipIfOAuthLogin = config.oauthLoginEnabled ? it.skip : it;
const runIfOAuthLogin = config.oauthLoginEnabled ? it : it.skip;

describe( 'User Can log in', () => {
	jest.setTimeout( 60000 );

	let mainWindow;
	let electronApp;
	let consoleStream;

	beforeAll( async () => {
		await mkdir( path.dirname( CONSOLE_PATH ), { recursive: true } );
		consoleStream = await createWriteStream( CONSOLE_PATH );

		electronApp = await electron.launch( {
			executablePath: APP_PATH,
			args: [ '--disable-http-cache', '--start-maximized' ],
			timeout: 0,
			recordHar: {
				path: HAR_PATH,
			},
			env: {
				...process.env,
				WP_DESKTOP_BASE_URL: BASE_URL,
				WP_DEBUG_LOG, // This will override logging path from the Electron main process.
				// Ensure other CI-specific overrides (such as disabling the auto-updater)
				DEBUG: true,
				CI: true,
			},
		} );

		// Find main window. Playwright has problems identifying the main window when using `firstWindow`, so we
		// iterate over all windows and find it by URL.
		for ( const window of await electronApp.windows() ) {
			const windowUrl = await window.url();
			if ( windowUrl.startsWith( BASE_URL ) ) {
				mainWindow = window;
				break;
			}
		}
		if ( ! mainWindow ) {
			mainWindow = await electronApp.firstWindow();
		}

		// Capture console
		mainWindow.on( 'console', ( data ) =>
			consoleStream.write( `${ new Date().toUTCString() } [${ data.type() }] ${ data.text() }\n` )
		);

		// Wait for everythingm to be loaded before starting
		await mainWindow.waitForLoadState();
		for ( const [ , frame ] of mainWindow.frames().entries() ) {
			await frame.waitForLoadState();
		}
	} );

	runIfOAuthLogin( 'Start the OAuth login flow', async function () {
		const loginButton = await mainWindow.waitForSelector(
			'a:has-text("Log in with WordPress.com")'
		);
		const href = await loginButton.getAttribute( 'href' );
		// eslint-disable-next-line jest/no-standalone-expect
		expect( href ).toBe( '/desktop-start-login' );
	} );

	skipIfOAuthLogin( 'Log in with username and password', async function () {
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

		// eslint-disable-next-line jest/no-standalone-expect
		expect( response.status() ).toBe( 200 );
	} );

	afterAll( async () => {
		if ( consoleStream ) {
			consoleStream.end();
		}

		if ( mainWindow ) {
			await mainWindow.screenshot( { path: SCREENSHOT_PATH } );
		}

		if ( electronApp ) {
			try {
				await electronApp.close();
			} catch {}
		}
	} );
} );
