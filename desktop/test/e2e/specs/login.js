/* eslint-disable no-console, import/no-nodejs-modules */
const { createWriteStream } = require( 'fs' );
const { mkdir } = require( 'fs/promises' );
const path = require( 'path' );
const { _electron: electron } = require( 'playwright' );

const APP_PATH = path.join( __dirname, '../../../release/linux-unpacked/wpcom' );
const CONSOLE_PATH = path.join( __dirname, '../results/console.log' );
const SCREENSHOT_PATH = path.join( __dirname, '../results/screenshot.png' );

describe( 'User Can log in', () => {
	jest.setTimeout( 30000 );

	let mainWindow;
	let electronApp;
	let consoleStream;

	beforeAll( async () => {
		electronApp = await electron.launch( {
			executablePath: APP_PATH,
			args: [ '--disable-http-cache', '--start-maximized' ],
		} );

		mainWindow = await electronApp.firstWindow();

		consoleStream = await createWriteStream( CONSOLE_PATH );

		await mkdir( path.dirname( CONSOLE_PATH ), { recursive: true } );
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
		}

		if ( electronApp ) {
			await electronApp.close();
		}
	} );
} );
