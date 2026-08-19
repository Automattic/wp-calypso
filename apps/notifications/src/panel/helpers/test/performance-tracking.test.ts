import { cancel, start, stop } from '@automattic/browser-data-collector';
import { startPerfReport, stopPerfReport } from '../performance-tracking';

jest.mock( '@automattic/browser-data-collector', () => ( {
	start: jest.fn( () => Promise.resolve() ),
	stop: jest.fn( () => Promise.resolve( true ) ),
	cancel: jest.fn(),
} ) );

const collector = { start, stop, cancel } as Record< string, jest.Mock >;

const LOAD_MORE = 'notifications-panel-load-more';

describe( 'performance-tracking', () => {
	let random: jest.SpyInstance;
	let now: jest.SpyInstance;

	beforeEach( () => {
		random = jest.spyOn( Math, 'random' ).mockReturnValue( 0 );
		now = jest.spyOn( Date, 'now' ).mockReturnValue( 1_000_000 );
	} );

	afterEach( () => {
		// The module tracks active reports in module state; stop any leftover so
		// tests can't leak an active report into each other.
		stopPerfReport( LOAD_MORE );
		jest.clearAllMocks();
		random.mockRestore();
		now.mockRestore();
	} );

	it( 'starts a report when sampled in', () => {
		expect( startPerfReport( LOAD_MORE ) ).toBe( true );
		expect( collector.start ).toHaveBeenCalledWith( LOAD_MORE, { fullPageLoad: false } );
	} );

	it( 'does not start a report when sampled out', () => {
		random.mockReturnValue( 0.99 );
		expect( startPerfReport( LOAD_MORE ) ).toBe( false );
		expect( collector.start ).not.toHaveBeenCalled();
	} );

	it( 'refuses a same-name start while a report is active', () => {
		expect( startPerfReport( LOAD_MORE ) ).toBe( true );
		expect( startPerfReport( LOAD_MORE ) ).toBe( false );
		expect( collector.start ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'only sends a stop for an active report, and only once', () => {
		stopPerfReport( LOAD_MORE );
		expect( collector.stop ).not.toHaveBeenCalled();

		startPerfReport( LOAD_MORE );
		stopPerfReport( LOAD_MORE );
		stopPerfReport( LOAD_MORE );
		expect( collector.stop ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'frees the name for a new report after a stop', () => {
		startPerfReport( LOAD_MORE );
		stopPerfReport( LOAD_MORE );
		expect( startPerfReport( LOAD_MORE ) ).toBe( true );
		expect( collector.start ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'cancels an abandoned report and starts fresh once it goes stale', () => {
		startPerfReport( LOAD_MORE );

		// Just under the stale window: still refused.
		now.mockReturnValue( 1_000_000 + 29_000 );
		expect( startPerfReport( LOAD_MORE ) ).toBe( false );
		expect( collector.cancel ).not.toHaveBeenCalled();

		// Past it: the wedged report is discarded and a new one starts.
		now.mockReturnValue( 1_000_000 + 31_000 );
		expect( startPerfReport( LOAD_MORE ) ).toBe( true );
		expect( collector.cancel ).toHaveBeenCalledWith( LOAD_MORE );
		expect( collector.start ).toHaveBeenCalledTimes( 2 );
	} );
} );
