const { EventEmitter } = require( 'events' );

jest.mock( '../../app/lib/logger', () => () => ( {
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
} ) );

function createApp() {
	const app = new EventEmitter();
	app.quit = jest.fn( () => {
		const event = { defaultPrevented: false, preventDefault: jest.fn() };
		event.preventDefault.mockImplementation( () => ( event.defaultPrevented = true ) );
		app.emit( 'before-quit', event );
		return event;
	} );
	return app;
}

const flushPromises = () => new Promise( ( resolve ) => setImmediate( resolve ) );

describe( 'cookie-flush', () => {
	let flushStore;
	let electron;

	beforeEach( () => {
		jest.resetModules();
		flushStore = jest.fn( () => Promise.resolve() );
		electron = {
			app: createApp(),
			session: { defaultSession: { cookies: { flushStore } } },
		};
		jest.doMock( 'electron', () => electron, { virtual: true } );
		require( '../../app/app-handlers/cookie-flush' )();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'defers the quit until cookies are flushed, then quits again', async () => {
		let finishFlush;
		flushStore.mockReturnValue( new Promise( ( resolve ) => ( finishFlush = resolve ) ) );

		const first = electron.app.quit();
		expect( first.defaultPrevented ).toBe( true );
		expect( flushStore ).toHaveBeenCalledTimes( 1 );

		await flushPromises();
		expect( electron.app.quit ).toHaveBeenCalledTimes( 1 );

		finishFlush();
		await flushPromises();

		expect( electron.app.quit ).toHaveBeenCalledTimes( 2 );
		expect( electron.app.quit.mock.results[ 1 ].value.defaultPrevented ).toBe( false );
		expect( flushStore ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not start a second flush while one is in progress', async () => {
		jest.useFakeTimers();
		flushStore.mockReturnValue( new Promise( () => {} ) );

		electron.app.quit();
		const second = electron.app.quit();

		expect( second.defaultPrevented ).toBe( true );
		expect( flushStore ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'still quits when the flush fails', async () => {
		flushStore.mockRejectedValue( new Error( 'boom' ) );

		electron.app.quit();
		await flushPromises();

		expect( electron.app.quit ).toHaveBeenCalledTimes( 2 );
		expect( electron.app.quit.mock.results[ 1 ].value.defaultPrevented ).toBe( false );
	} );

	it( 'still quits when the flush throws synchronously', async () => {
		flushStore.mockImplementation( () => {
			throw new Error( 'boom' );
		} );

		electron.app.quit();
		await flushPromises();

		expect( electron.app.quit ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'quits after a timeout when the flush never finishes', async () => {
		jest.useFakeTimers();
		flushStore.mockReturnValue( new Promise( () => {} ) );

		electron.app.quit();
		await jest.advanceTimersByTimeAsync( 1999 );
		expect( electron.app.quit ).toHaveBeenCalledTimes( 1 );

		await jest.advanceTimersByTimeAsync( 1 );
		expect( electron.app.quit ).toHaveBeenCalledTimes( 2 );
		expect( electron.app.quit.mock.results[ 1 ].value.defaultPrevented ).toBe( false );
	} );

	it( 'flushes again on a later quit if the previous one was cancelled', async () => {
		electron.app.quit();
		await flushPromises();
		expect( flushStore ).toHaveBeenCalledTimes( 1 );

		const later = electron.app.quit();
		expect( later.defaultPrevented ).toBe( true );
		expect( flushStore ).toHaveBeenCalledTimes( 2 );
	} );
} );
