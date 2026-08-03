/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
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

const { fetchSitePlugins, activatePlugin } = jest.requireMock(
	'calypso/state/plugins/installed/actions'
);

const INSTALLED = { slug: 'sensei-pro', id: 'sensei-pro/sensei-pro' };

type Props = Parameters< typeof usePostTransferPluginRecovery >[ 0 ];
const defaults: Props = {
	siteId: 1,
	enabled: true,
	canActivate: true,
	ownsActivation: true,
	installedPlugin: INSTALLED,
};
const render = ( props?: Partial< Props > ) =>
	renderHook( ( p: Props ) => usePostTransferPluginRecovery( p ), {
		initialProps: { ...defaults, ...props },
	} );
const tick = () => mockIntervalCallback?.();
// The in-flight guard clears in the dispatched thunk's `.finally`, a microtask; let it settle.
const settle = () => Promise.resolve();

describe( 'usePostTransferPluginRecovery', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIntervalCallback = null;
		mockIntervalDelay = null;
	} );

	it( 'polls the site plugins on an interval while enabled', () => {
		render( { installedPlugin: null } );
		expect( mockIntervalDelay ).toBe( 3000 );
		tick();
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
	} );

	it( 'does not poll while disabled', () => {
		render( { enabled: false } );
		expect( mockIntervalDelay ).toBeNull();
	} );

	it( 'nudges an installed-but-inactive plugin active on a tick', () => {
		render();
		tick();
		expect( activatePlugin ).toHaveBeenCalledWith( 1, {
			slug: 'sensei-pro',
			id: 'sensei-pro/sensei-pro',
		} );
	} );

	it( 'does not consume the retry budget while it cannot yet activate', async () => {
		const { rerender } = render( { canActivate: false } );
		tick();
		tick();
		expect( activatePlugin ).not.toHaveBeenCalled();

		// Once ready, all attempts remain available.
		rerender( defaults );
		tick();
		await settle();
		tick();
		await settle();
		tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'does not start a new attempt while the previous one is still in flight', () => {
		render();
		tick();
		tick();
		tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'retries a bounded number of times once attempts settle, not forever', async () => {
		render();
		for ( let i = 0; i < 6; i++ ) {
			tick();
			await settle();
		}
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'refreshes the plugin list right after activating, without waiting for the next poll', async () => {
		render();
		tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
		const pollFetches = fetchSitePlugins.mock.calls.length;
		await settle();
		expect( fetchSitePlugins.mock.calls.length ).toBeGreaterThan( pollFetches );
		expect( fetchSitePlugins ).toHaveBeenLastCalledWith( 1 );
	} );

	it( 'does not activate when it does not own activation (the step-driven flow does)', () => {
		render( { ownsActivation: false } );
		tick();
		expect( activatePlugin ).not.toHaveBeenCalled();
	} );

	it( 'waits to activate until the plugin appears in the refreshed list', () => {
		const { rerender } = render( { installedPlugin: null } );
		tick();
		expect( activatePlugin ).not.toHaveBeenCalled();

		rerender( defaults );
		tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );
} );
