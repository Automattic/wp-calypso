/**
 * @jest-environment jsdom
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useWaitHeartbeat } from '../index';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const mockRecordTracksEvent = recordTracksEvent as jest.MockedFunction< typeof recordTracksEvent >;

type Props = { enabled: boolean; properties?: Record< string, unknown > };

const eventsNamed = ( name: string ) =>
	mockRecordTracksEvent.mock.calls.filter( ( [ eventName ] ) => eventName === name );

const propsOf = ( name: string ) =>
	eventsNamed( name ).map(
		( [ , properties ] ) => ( properties ?? {} ) as Record< string, unknown >
	);

const advance = async ( ms: number ) => {
	await act( async () => {
		jest.advanceTimersByTime( ms );
	} );
};

const setVisibility = ( state: 'visible' | 'hidden' ) => {
	Object.defineProperty( document, 'visibilityState', { value: state, configurable: true } );
	act( () => {
		document.dispatchEvent( new Event( 'visibilitychange' ) );
	} );
};

const pageTransition = ( name: 'pagehide' | 'pageshow', persisted: boolean ) =>
	act( () => {
		const event = new Event( name ) as PageTransitionEvent;
		Object.defineProperty( event, 'persisted', { value: persisted } );
		window.dispatchEvent( event );
	} );

const renderHeartbeat = ( initialProps: Props = { enabled: true } ) =>
	renderHook(
		( props: Props ) => useWaitHeartbeat( { surface: 'marketplace_install', ...props } ),
		{
			initialProps,
		}
	);

describe( 'useWaitHeartbeat', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-10T12:00:00Z' ) );
		setVisibility( 'visible' );
	} );
	afterEach( () => {
		// Before the mock is cleared: a mounted wait emits its closing event as it unmounts, and
		// that event belongs to the test that started it, not to the next one.
		cleanup();
		jest.useRealTimers();
		jest.clearAllMocks();
	} );

	it( 'opens the bracket when the wait starts', () => {
		renderHeartbeat();
		expect( eventsNamed( 'calypso_transfer_wait_started' ) ).toHaveLength( 1 );
	} );

	it( 'stays silent while the wait is not running', async () => {
		renderHeartbeat( { enabled: false } );
		await advance( 5 * 60 * 1000 );
		expect( mockRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'beats on an interval while the wait runs', async () => {
		renderHeartbeat();
		await advance( 61 * 1000 );
		expect( eventsNamed( 'calypso_transfer_wait_heartbeat' ) ).toHaveLength( 3 );
	} );

	it( 'closes the bracket when the wait stops', async () => {
		const { rerender } = renderHeartbeat();
		await advance( 40 * 1000 );
		rerender( { enabled: false } );

		expect( eventsNamed( 'calypso_transfer_wait_ended' ) ).toHaveLength( 1 );
		expect( propsOf( 'calypso_transfer_wait_ended' )[ 0 ] ).toMatchObject( {
			waited_seconds: 40,
			reason: 'stopped',
		} );
	} );

	it( 'closes the bracket when the screen unmounts', () => {
		const { unmount } = renderHeartbeat();
		unmount();
		expect( eventsNamed( 'calypso_transfer_wait_ended' ) ).toHaveLength( 1 );
	} );

	// Every event of one wait carries the same id, which is what joins them server-side.
	it( 'correlates a wait with one id', async () => {
		const { unmount } = renderHeartbeat();
		await advance( 41 * 1000 );
		unmount();

		const ids = new Set(
			mockRecordTracksEvent.mock.calls.map(
				( [ , properties ] ) => ( properties as Record< string, unknown > ).wait_id
			)
		);
		expect( mockRecordTracksEvent.mock.calls.length ).toBeGreaterThan( 2 );
		expect( ids.size ).toBe( 1 );
	} );

	// A backgrounded tab is not an abandoned one, so the beat continues and says which it was.
	it( 'keeps beating while the tab is hidden, and marks it', async () => {
		renderHeartbeat();
		await advance( 21 * 1000 );
		setVisibility( 'hidden' );
		await advance( 20 * 1000 );

		const beats = propsOf( 'calypso_transfer_wait_heartbeat' );
		expect( beats[ 0 ] ).toMatchObject( { is_visible: true } );
		expect( beats[ beats.length - 1 ] ).toMatchObject( { is_visible: false } );
	} );

	// Browsers throttle and suspend timers in background tabs, so the interval cannot be trusted to
	// mark the moment a tab went away. Without this marker a throttled wait and an abandoned one
	// look the same.
	it( 'marks the tab going away without waiting for the next interval', () => {
		renderHeartbeat();
		setVisibility( 'hidden' );

		const beats = propsOf( 'calypso_transfer_wait_heartbeat' );
		expect( beats ).toHaveLength( 1 );
		expect( beats[ 0 ] ).toMatchObject( { trigger: 'visibility', is_visible: false } );
	} );

	// A stretched gap is what a throttled beat looks like, so the distance between events has to be
	// recorded rather than assumed to be one interval. Fake timers never throttle, so this measures
	// the field on an off-interval event instead of simulating a background tab.
	it( 'records the real distance from the previous event', async () => {
		renderHeartbeat();
		await advance( 30 * 1000 );
		setVisibility( 'hidden' );

		const beats = propsOf( 'calypso_transfer_wait_heartbeat' );
		expect( beats[ beats.length - 1 ] ).toMatchObject( {
			trigger: 'visibility',
			seconds_since_previous: 10,
		} );
	} );

	it( 'counts only the visible stretches as visible time', async () => {
		renderHeartbeat();
		await advance( 10 * 1000 );
		setVisibility( 'hidden' );
		await advance( 30 * 1000 );
		setVisibility( 'visible' );
		await advance( 20 * 1000 );

		const beats = propsOf( 'calypso_transfer_wait_heartbeat' );
		expect( beats[ beats.length - 1 ] ).toMatchObject( {
			waited_seconds: 60,
			visible_seconds: 30,
		} );
	} );

	// The count is an ordinal for the beats of one wait. Skipping the visibility ones would repeat a
	// number across two events, in exactly the hidden and throttled cases this exists to measure.
	it( 'numbers every beat, whatever triggered it', async () => {
		renderHeartbeat();
		await advance( 21 * 1000 );
		setVisibility( 'hidden' );
		setVisibility( 'visible' );
		await advance( 20 * 1000 );

		const counts = propsOf( 'calypso_transfer_wait_heartbeat' ).map(
			( properties ) => properties.heartbeat_count
		);
		expect( counts ).toEqual( [ 1, 2, 3, 4 ] );
	} );

	// A wait screen left in a forgotten tab would otherwise beat for as long as the tab lives.
	it( 'stops beating once the cap is passed', async () => {
		renderHeartbeat();
		await advance( 20 * 60 * 1000 );
		const beatsAtCap = eventsNamed( 'calypso_transfer_wait_heartbeat' ).length;

		await advance( 10 * 60 * 1000 );

		expect( eventsNamed( 'calypso_transfer_wait_heartbeat' ) ).toHaveLength( beatsAtCap );
		expect( beatsAtCap ).toBeLessThanOrEqual( ( 15 * 60 ) / 20 );
		expect( propsOf( 'calypso_transfer_wait_ended' )[ 0 ] ).toMatchObject( { reason: 'capped' } );
	} );

	// The plugin flow leaves by full-page navigation, which never unmounts anything.
	it( 'closes the bracket when the page goes away', () => {
		renderHeartbeat();
		pageTransition( 'pagehide', false );

		expect( propsOf( 'calypso_transfer_wait_ended' )[ 0 ] ).toMatchObject( {
			reason: 'page_hidden',
		} );
	} );

	// The back-forward cache freezes the document rather than tearing it down, and the customer can
	// come back to a wait that is still running.
	it( 'keeps the wait open when the page is only frozen', () => {
		renderHeartbeat();
		pageTransition( 'pagehide', true );

		expect( eventsNamed( 'calypso_transfer_wait_ended' ) ).toHaveLength( 0 );
	} );

	// Not every browser fires `visibilitychange` around the cache, and the pair below is the only one
	// guaranteed to. Without it the frozen stretch would count as visible and the return go unmarked.
	it( 'brackets the frozen stretch when no visibility event fires', async () => {
		renderHeartbeat();
		await advance( 10 * 1000 );
		pageTransition( 'pagehide', true );
		await advance( 30 * 1000 );
		pageTransition( 'pageshow', true );
		await advance( 20 * 1000 );

		const beats = propsOf( 'calypso_transfer_wait_heartbeat' );
		expect( beats[ 0 ] ).toMatchObject( { trigger: 'visibility', is_visible: false } );
		expect( beats[ beats.length - 1 ] ).toMatchObject( {
			waited_seconds: 60,
			visible_seconds: 30,
		} );
	} );

	// Otherwise the browser that already fired it would have the stretch banked twice over.
	it( 'does not double up when the browser fires both', async () => {
		renderHeartbeat();
		await advance( 10 * 1000 );
		setVisibility( 'hidden' );
		pageTransition( 'pagehide', true );
		await advance( 30 * 1000 );
		setVisibility( 'visible' );
		pageTransition( 'pageshow', true );
		await advance( 20 * 1000 );

		const beats = propsOf( 'calypso_transfer_wait_heartbeat' );
		expect( beats[ beats.length - 1 ] ).toMatchObject( {
			waited_seconds: 60,
			visible_seconds: 30,
		} );
		expect( beats.filter( ( properties ) => properties.trigger === 'visibility' ) ).toHaveLength(
			2
		);
	} );

	// Coming out of the cache is not the same as being looked at: a tab can be restored while still
	// in the background.
	it( 'does not count the frozen stretch as visible when it comes back hidden', async () => {
		renderHeartbeat();
		await advance( 10 * 1000 );
		setVisibility( 'hidden' );
		await advance( 30 * 1000 );
		pageTransition( 'pageshow', true );
		setVisibility( 'visible' );
		await advance( 20 * 1000 );

		const beats = propsOf( 'calypso_transfer_wait_heartbeat' );
		expect( beats[ beats.length - 1 ] ).toMatchObject( {
			waited_seconds: 60,
			visible_seconds: 30,
		} );
	} );

	// A tab hidden past the cap has had its timers suspended, so coming back is the first chance to
	// notice the wait should already be closed.
	it( 'closes a wait that comes back from beyond the cap', () => {
		renderHeartbeat();
		setVisibility( 'hidden' );
		mockRecordTracksEvent.mockClear();
		// The clock moves but the timers do not, which is the whole point: a suspended interval never
		// runs to notice the cap.
		jest.setSystemTime( Date.now() + 20 * 60 * 1000 );

		setVisibility( 'visible' );

		expect( eventsNamed( 'calypso_transfer_wait_heartbeat' ) ).toHaveLength( 0 );
		// Flagged, because `waited_seconds` here is the whole time the tab sat there rather than the
		// cap, and comparing it with the waits the interval closed would inflate the tail.
		expect( propsOf( 'calypso_transfer_wait_ended' )[ 0 ] ).toMatchObject( {
			reason: 'capped',
			capped_on_return: true,
		} );
	} );

	// Otherwise one wait would be counted twice: once on the way out of the page, once on unmount.
	it( 'closes the bracket only once', () => {
		const { unmount } = renderHeartbeat();
		pageTransition( 'pagehide', false );
		unmount();

		expect( eventsNamed( 'calypso_transfer_wait_ended' ) ).toHaveLength( 1 );
	} );

	it( 'carries the surface and the caller context on every event', async () => {
		renderHeartbeat( { enabled: true, properties: { flow: 'plugin', product_slug: 'give' } } );
		await advance( 21 * 1000 );

		expect( mockRecordTracksEvent.mock.calls.length ).toBeGreaterThan( 1 );
		for ( const [ , properties ] of mockRecordTracksEvent.mock.calls ) {
			expect( properties ).toMatchObject( {
				surface: 'marketplace_install',
				flow: 'plugin',
				product_slug: 'give',
			} );
		}
	} );

	// A caller that shadows one of these would break the correlation every query depends on, and do
	// it silently.
	it( 'does not let the caller overwrite the fields identifying the wait', async () => {
		renderHeartbeat( {
			enabled: true,
			properties: {
				surface: 'not_a_surface',
				wait_id: 'not-a-wait-id',
				waited_seconds: 9999,
				is_visible: 'nonsense',
			},
		} );
		await advance( 21 * 1000 );

		for ( const [ , properties ] of mockRecordTracksEvent.mock.calls ) {
			expect( properties ).toMatchObject( { surface: 'marketplace_install' } );
			expect( ( properties as Record< string, unknown > ).wait_id ).not.toBe( 'not-a-wait-id' );
			expect( ( properties as Record< string, unknown > ).waited_seconds ).not.toBe( 9999 );
			expect( ( properties as Record< string, unknown > ).is_visible ).toBe( true );
		}
	} );

	// The outcome is only known on the render that ends the wait, so the closing event has to read
	// the context of that render rather than the one the wait started with.
	it( 'closes with the context as it stands at the end', async () => {
		const { rerender } = renderHeartbeat( {
			enabled: true,
			properties: { outcome: null },
		} );
		await advance( 21 * 1000 );

		rerender( { enabled: false, properties: { outcome: 'timeout' } } );

		expect( propsOf( 'calypso_transfer_wait_ended' )[ 0 ] ).toMatchObject( { outcome: 'timeout' } );
	} );
} );
