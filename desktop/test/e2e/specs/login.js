/* eslint-disable no-console, import/no-nodejs-modules */
const { createWriteStream } = require( 'fs' );
const { mkdir } = require( 'fs/promises' );
const path = require( 'path' );
const { _electron: electron } = require( 'playwright' );

let APP_PATH;

switch ( process.platform ) {
	case 'linux':
		APP_PATH = path.join( __dirname, '../../../release/linux-unpacked/wpcom' );
		break;
	case 'darwin':
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
const VIDEO_PATH = path.join( __dirname, '../results/video.webm' );
const WP_DEBUG_LOG = path.resolve( __dirname, '../results/app.log' );

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
			recordVideo: {
				dir: path.dirname( SCREENSHOT_PATH ),
			},
			timeout: 0,
			recordHar: {
				path: HAR_PATH,
			},
			env: {
				WP_DEBUG_LOG, // This will override logging path from the Electron main process.
				// Ensure other CI-specific overrides (such as disabling the auto-updater)
				DEBUG: true,
				CI: true,
				...process.env,
			},
		} );
		electronApp.context().tracing.start( { screenshots: true } );

		mainWindow = await electronApp.firstWindow();
		mainWindow.on( 'console', ( data ) =>
			consoleStream.write( `${ new Date().toUTCString() } [${ data.type() }] ${ data.text() }\n` )
		);

		await mainWindow.waitForLoadState();
		for ( const [ , frame ] of mainWindow.frames().entries() ) {
			await frame.waitForLoadState();
		}

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
