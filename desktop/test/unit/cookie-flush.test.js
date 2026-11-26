import { vi } from 'vitest';
const { EventEmitter } = require( 'events' );

vi.mock( '../../app/lib/logger', () => ( {
	default: () => ( {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	} ),
} ) );

function createApp() {
	const app = new EventEmitter();
	app.quit = vi.fn( () => {
		const event = { defaultPrevented: false, preventDefault: vi.fn() };
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

	beforeEach( async () => {
		vi.resetModules();
		flushStore = vi.fn( () => Promise.resolve() );
		electron = {
			app: createApp(),
			session: { defaultSession: { cookies: { flushStore } } },
		};
		vi.doMock( 'electron', () => electron );
		( await import( '../../app/app-handlers/cookie-flush' ) ).default();
	} );

	afterEach( () => {
		vi.useRealTimers();
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
		vi.useFakeTimers();
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
		vi.useFakeTimers();
		flushStore.mockReturnValue( new Promise( () => {} ) );

		electron.app.quit();
		await vi.advanceTimersByTimeAsync( 1999 );
		expect( electron.app.quit ).toHaveBeenCalledTimes( 1 );

		await vi.advanceTimersByTimeAsync( 1 );
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
