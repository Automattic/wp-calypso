/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { usePostTransferPluginRecovery } from '../use-post-transfer-plugin-recovery';

const mockDispatch = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );
jest.mock( 'calypso/state/plugins/installed/actions', () => ( {
	fetchSitePlugins: jest.fn( ( siteId: number ) => ( { type: 'FETCH_SITE_PLUGINS', siteId } ) ),
	activatePlugin: jest.fn( ( siteId: number, plugin: unknown ) => ( {
		type: 'ACTIVATE_PLUGIN',
		siteId,
		plugin,
	} ) ),
	installPlugin: jest.fn( ( siteId: number, plugin: unknown ) => ( {
		type: 'INSTALL_PLUGIN',
		siteId,
		plugin,
	} ) ),
} ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// Capture what useInterval was scheduled with, and let the test drive the tick.
let mockIntervalCallback: ( () => void ) | null = null;
let mockIntervalDelay: number | null = null;
jest.mock( 'calypso/lib/interval', () => ( {
	useInterval: ( callback: () => void, delay: number | null ) => {
		mockIntervalCallback = callback;
		mockIntervalDelay = delay;
	},
} ) );

const { fetchSitePlugins, activatePlugin, installPlugin } = jest.requireMock(
	'calypso/state/plugins/installed/actions'
);
const { recordTracksEvent } = jest.requireMock( 'calypso/lib/analytics/tracks' );

const INSTALLED = { slug: 'sensei-pro', id: 'sensei-pro/sensei-pro' };

type Props = Parameters< typeof usePostTransferPluginRecovery >[ 0 ];
const defaults: Props = {
	siteId: 1,
	enabled: true,
	canActivate: true,
	ownsActivation: true,
	installedPlugin: INSTALLED,
	reinstallSlug: 'sensei-pro',
};
const render = ( props?: Partial< Props > ) =>
	renderHook( ( p: Props ) => usePostTransferPluginRecovery( p ), {
		initialProps: { ...defaults, ...props },
	} );
const tick = () => act( () => mockIntervalCallback?.() );
// The in-flight guard clears in the dispatched thunk's `.finally`, a microtask; let it settle.
const settle = () => act( () => Promise.resolve() );
// Backoff is measured on the wall clock, which modern fake timers move with them.
const elapse = ( ms: number ) => act( () => jest.advanceTimersByTime( ms ) );

describe( 'usePostTransferPluginRecovery', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockIntervalCallback = null;
		mockIntervalDelay = null;
	} );
	afterEach( () => jest.useRealTimers() );

	it( 'lists the site plugins as soon as it is enabled, then on an interval', () => {
		render( { installedPlugin: null } );
		expect( fetchSitePlugins ).toHaveBeenCalledTimes( 1 );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
		expect( mockIntervalDelay ).toBe( 3000 );
		tick();
		expect( fetchSitePlugins ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does nothing while disabled', () => {
		render( { enabled: false } );
		expect( fetchSitePlugins ).not.toHaveBeenCalled();
		expect( mockIntervalDelay ).toBeNull();
	} );

	it( 'nudges an installed-but-inactive plugin active without waiting for a tick', () => {
		render();
		expect( activatePlugin ).toHaveBeenCalledWith( 1, {
			slug: 'sensei-pro',
			id: 'sensei-pro/sensei-pro',
		} );
	} );

	it( 'activates the moment the capability gap closes', () => {
		const { rerender } = render( { canActivate: false } );
		tick();
		tick();
		expect( activatePlugin ).not.toHaveBeenCalled();

		rerender( defaults );
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not start a new attempt while the previous one is still in flight', () => {
		render();
		elapse( 60000 );
		tick();
		tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	// The backend activates the plugin itself once its job runs, so a retry here is a fallback that
	// should not hammer a site still coming up — but it must not stop either, since that job can fail.
	it( 'backs off between attempts instead of giving up', async () => {
		render();
		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );

		elapse( 1000 );
		tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );

		elapse( 2000 );
		tick();
		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 2 );

		elapse( 3000 );
		tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 2 );

		elapse( 3000 );
		tick();
		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );

		elapse( 12000 );
		tick();
		await settle();
		elapse( 24000 );
		tick();
		await settle();
		elapse( 30000 );
		tick();
		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 6 );
	} );

	it( 'refreshes the plugin list right after activating, without waiting for the next poll', async () => {
		render();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
		const fetchesBeforeSettle = fetchSitePlugins.mock.calls.length;
		await settle();
		expect( fetchSitePlugins.mock.calls.length ).toBeGreaterThan( fetchesBeforeSettle );
		expect( fetchSitePlugins ).toHaveBeenLastCalledWith( 1 );
	} );

	it( 'does not activate when it does not own activation (the step-driven flow does)', () => {
		render( { ownsActivation: false } );
		tick();
		expect( activatePlugin ).not.toHaveBeenCalled();
	} );

	it( 'activates as soon as the plugin appears in the refreshed list', () => {
		const { rerender } = render( { installedPlugin: null } );
		tick();
		expect( activatePlugin ).not.toHaveBeenCalled();

		rerender( defaults );
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	// A transfer can report complete without ever installing the plugin it was asked for. Give its
	// install job a while to land, then do it from here rather than leaving the wait to time out.
	describe( 'when the transfer dropped the plugin', () => {
		const pollUntil = ( ms: number ) => {
			for ( let elapsed = 0; elapsed < ms; elapsed += 3000 ) {
				elapse( 3000 );
				tick();
			}
		};

		it( 'installs the plugin once it has stayed absent from a usable site for 30s', async () => {
			render( { installedPlugin: null } );
			pollUntil( 27000 );
			expect( installPlugin ).not.toHaveBeenCalled();

			pollUntil( 3000 );
			expect( installPlugin ).toHaveBeenCalledTimes( 1 );
			expect( installPlugin ).toHaveBeenCalledWith( 1, { slug: 'sensei-pro' } );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_marketplace_install_plugin_reinstall',
				{ site_id: 1, plugin_slug: 'sensei-pro' }
			);
			expect( activatePlugin ).not.toHaveBeenCalled();

			await settle();
			expect( fetchSitePlugins ).toHaveBeenLastCalledWith( 1 );
		} );

		it( 'installs at most once', () => {
			render( { installedPlugin: null } );
			pollUntil( 120000 );
			expect( installPlugin ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'counts the absence only while the site is usable', () => {
			const { rerender } = render( { installedPlugin: null, canActivate: false } );
			pollUntil( 60000 );
			expect( installPlugin ).not.toHaveBeenCalled();

			rerender( { ...defaults, installedPlugin: null } );
			pollUntil( 27000 );
			expect( installPlugin ).not.toHaveBeenCalled();
			pollUntil( 3000 );
			expect( installPlugin ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'stands down when the plugin shows up on its own', () => {
			const { rerender } = render( { installedPlugin: null } );
			pollUntil( 15000 );
			rerender( defaults );
			pollUntil( 60000 );
			expect( installPlugin ).not.toHaveBeenCalled();
			expect( activatePlugin ).toHaveBeenCalled();
		} );

		it( 'does nothing without a slug to install from (a zip upload)', () => {
			render( { installedPlugin: null, reinstallSlug: null } );
			pollUntil( 60000 );
			expect( installPlugin ).not.toHaveBeenCalled();
		} );

		it( 'does not install when it does not own the plugin', () => {
			render( { installedPlugin: null, ownsActivation: false } );
			pollUntil( 60000 );
			expect( installPlugin ).not.toHaveBeenCalled();
		} );
	} );
} );
