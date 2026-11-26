import { dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import { vi } from 'vitest';
import AutoUpdater from '../../app/app-handlers/updater/auto-updater';
import AppQuit from '../../app/lib/app-quit';

// Electron adds this to `process`; the updater reads it when it loads.
vi.hoisted( () => {
	process.getSystemVersion = () => '26.0.0';
} );

vi.mock( 'electron', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		app: { getVersion: () => '8.2.5' },
		dialog: { showMessageBox: vi.fn( () => Promise.resolve( { response: 1 } ) ) },
		shell: { openExternal: vi.fn() },
		BrowserWindow: { getFocusedWindow: () => null },
	} )
);

vi.mock( 'electron-updater', async () => {
	const { EventEmitter } = await vi.importActual( 'events' );
	const updater = new EventEmitter();
	updater.checkForUpdates = vi.fn( () => Promise.resolve() );
	updater.downloadUpdate = vi.fn( () => Promise.resolve() );
	updater.quitAndInstall = vi.fn();
	return { autoUpdater: updater };
} );

vi.mock( '../../app/lib/config', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		appName: 'WordPress.com',
		updater: { downloadUrl: 'https://example.com/download/' },
	} )
);
vi.mock( '../../app/lib/desktop-analytics', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		bumpStat: vi.fn(),
		sanitizeVersion: ( version ) => version,
		getPlatform: () => 'osx',
	} )
);
vi.mock( '../../app/lib/debug-tools', () =>
	( ( m ) => ( { ...m, default: m } ) )( { dialog: vi.fn() } )
);
vi.mock( '../../app/lib/logger', () => ( {
	default: () => ( {
		info: vi.fn(),
		error: vi.fn(),
	} ),
} ) );

const flushPromises = () => new Promise( ( resolve ) => setImmediate( resolve ) );

describe( 'AutoUpdater', () => {
	let updater;
	const originalDebug = process.env.DEBUG;

	beforeEach( () => {
		delete process.env.DEBUG;
		autoUpdater.removeAllListeners();
		vi.clearAllMocks();
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
