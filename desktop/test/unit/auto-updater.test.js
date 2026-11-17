jest.mock( 'electron', () => ( {
	app: { getVersion: () => '8.2.5' },
	dialog: { showMessageBox: jest.fn( () => Promise.resolve( { response: 1 } ) ) },
	shell: { openExternal: jest.fn() },
	BrowserWindow: { getFocusedWindow: () => null },
} ) );

jest.mock( 'electron-updater', () => {
	const { EventEmitter } = require( 'events' );
	const autoUpdater = new EventEmitter();
	autoUpdater.checkForUpdates = jest.fn( () => Promise.resolve() );
	autoUpdater.downloadUpdate = jest.fn( () => Promise.resolve() );
	autoUpdater.quitAndInstall = jest.fn();
	return { autoUpdater };
} );

jest.mock( '../../app/lib/config', () => ( {
	appName: 'WordPress.com',
	updater: { downloadUrl: 'https://example.com/download/' },
} ) );
jest.mock( '../../app/lib/desktop-analytics', () => ( {
	bumpStat: jest.fn(),
	sanitizeVersion: ( version ) => version,
	getPlatform: () => 'osx',
} ) );
jest.mock( '../../app/lib/debug-tools', () => ( { dialog: jest.fn() } ) );
jest.mock( '../../app/lib/logger', () => () => ( {
	info: jest.fn(),
	error: jest.fn(),
} ) );

// Electron adds this to `process`; the updater reads it when it loads.
process.getSystemVersion = () => '26.0.0';

const { dialog, shell } = require( 'electron' );
const { autoUpdater } = require( 'electron-updater' );
const AutoUpdater = require( '../../app/app-handlers/updater/auto-updater' );
const AppQuit = require( '../../app/lib/app-quit' );

const flushPromises = () => new Promise( ( resolve ) => setImmediate( resolve ) );

describe( 'AutoUpdater', () => {
	let updater;
	const originalDebug = process.env.DEBUG;

	beforeEach( () => {
		delete process.env.DEBUG;
		autoUpdater.removeAllListeners();
		jest.clearAllMocks();
		AppQuit.disallowQuit();
		updater = new AutoUpdater();
	} );

	afterAll( () => {
		process.env.DEBUG = originalDebug;
	} );

	const messages = () =>
		dialog.showMessageBox.mock.calls.map( ( [ , options ] ) => options.message );

	it( 'tells the user an update is downloading when they checked for updates', () => {
		updater.ping( true );
		autoUpdater.emit( 'update-available', { version: '8.2.6' } );

		expect( autoUpdater.downloadUpdate ).toHaveBeenCalledTimes( 1 );
		expect( messages() ).toEqual( [ 'WordPress.com 8.2.6 is available.' ] );
	} );

	it( 'downloads silently on a scheduled check', () => {
		updater.ping();
		autoUpdater.emit( 'update-available', { version: '8.2.6' } );

		expect( autoUpdater.downloadUpdate ).toHaveBeenCalledTimes( 1 );
		expect( dialog.showMessageBox ).not.toHaveBeenCalled();
	} );

	it( 'keeps a manual check pending when a scheduled check starts before it finishes', () => {
		updater.ping( true );
		updater.ping();
		autoUpdater.emit( 'update-not-available', {} );

		expect( messages() ).toEqual( [ 'There are currently no updates available.' ] );
	} );

	it( 'prompts for the downloaded update again without downloading it twice', async () => {
		autoUpdater.emit( 'update-downloaded', { version: '8.2.6' } );
		await flushPromises();
		dialog.showMessageBox.mockClear();

		updater.ping( true );
		autoUpdater.emit( 'update-available', { version: '8.2.6' } );

		expect( autoUpdater.downloadUpdate ).not.toHaveBeenCalled();
		expect( messages() ).toEqual( [ 'A new version of WordPress.com is available!' ] );
	} );

	it( 'reports a failed manual check', async () => {
		updater.ping( true );
		autoUpdater.emit( 'error', new Error( 'net::ERR_INTERNET_DISCONNECTED' ) );
		await flushPromises();

		expect( messages() ).toEqual( [ 'WordPress.com couldn’t be updated.' ] );
	} );

	it( 'does not interrupt the user when a scheduled check fails', () => {
		updater.ping();
		autoUpdater.emit( 'error', new Error( 'net::ERR_INTERNET_DISCONNECTED' ) );

		expect( dialog.showMessageBox ).not.toHaveBeenCalled();
	} );

	it( 'reports a failed install, offers the download page and stops the app from quitting', async () => {
		dialog.showMessageBox.mockResolvedValueOnce( { response: 0 } );

		updater.onConfirm();
		expect( autoUpdater.quitAndInstall ).toHaveBeenCalled();

		autoUpdater.emit(
			'error',
			new Error( 'Code signature did not pass validation: bundle format is ambiguous' )
		);
		await flushPromises();

		expect( messages() ).toEqual( [ 'WordPress.com couldn’t be updated.' ] );
		expect( shell.openExternal ).toHaveBeenCalledWith( 'https://example.com/download/' );
		expect( AppQuit.shouldQuitToBackground() ).toBe( true );
	} );

	it( 'offers the beta download page when a beta install fails', async () => {
		dialog.showMessageBox.mockResolvedValueOnce( { response: 0 } );
		updater = new AutoUpdater( { beta: true } );

		updater.onConfirm();
		autoUpdater.emit( 'error', new Error( 'Code signature did not pass validation' ) );
		await flushPromises();

		expect( shell.openExternal ).toHaveBeenCalledWith( 'https://example.com/download/?beta=1' );
	} );
} );
