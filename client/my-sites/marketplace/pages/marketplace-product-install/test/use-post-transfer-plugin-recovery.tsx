/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { usePostTransferPluginRecovery } from '../use-post-transfer-plugin-recovery';

// What the dispatched plugin-list thunk resolves to: true when the site reported its plugins.
let mockListRead: boolean | undefined = true;
const mockDispatch = jest.fn( ( action: { type?: string } ) =>
	action?.type === 'FETCH_SITE_PLUGINS' ? Promise.resolve( mockListRead ) : undefined
);
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
	runImmediately: true,
	canActivate: true,
	ownsActivation: true,
	installedPlugin: INSTALLED,
};
const render = ( props?: Partial< Props > ) =>
	renderHook( ( p: Props ) => usePostTransferPluginRecovery( p ), {
		initialProps: { ...defaults, ...props },
	} );
// A cycle chains several promises before it settles; let them all run.
const settle = () =>
	act( async () => {
		for ( let i = 0; i < 8; i++ ) {
			await Promise.resolve();
		}
	} );
// Start a cycle without waiting for it, for asserting on what happens mid-cycle.
const tickNow = () => act( () => void mockIntervalCallback?.() );
// One cycle, run to completion. Only one runs at a time, so a tick mid-cycle is a no-op by design.
const tick = async () => {
	tickNow();
	await settle();
};

describe( 'usePostTransferPluginRecovery', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIntervalCallback = null;
		mockIntervalDelay = null;
		mockListRead = true;
	} );

	it( 'does not let failed requests stand in for looks at the site', async () => {
		// A request that failed left the previous list in place. Were the two counted together, the
		// rounds below would add up to a conclusion that the plugin is not there.
		mockListRead = false;
		const { result } = render( { installedPlugin: null } );
		await settle();
		await tick();
		await tick();

		mockListRead = true;
		await tick();
		await tick();
		expect( result.current ).toBe( 'searching' );

		// Looks at the site do add up.
		await tick();
		await tick();
		await tick();
		expect( result.current ).toBe( 'exhausted' );
	} );

	it( 'polls the site plugins on an interval while enabled', async () => {
		render( { installedPlugin: null } );
		expect( mockIntervalDelay ).toBe( 3000 );
		await tick();
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
	} );

	it( 'looks once straight away rather than waiting out the first interval', async () => {
		render( { installedPlugin: null } );
		await settle();
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
	} );

	it( 'runs one plugin-list request at a time', async () => {
		// Overlapping requests can settle out of order, so a round would not mean a current answer.
		render( { installedPlugin: null } );
		const duringFirst = fetchSitePlugins.mock.calls.length;
		tickNow();
		expect( fetchSitePlugins.mock.calls.length ).toBe( duringFirst );

		await settle();
		await tick();
		expect( fetchSitePlugins.mock.calls.length ).toBeGreaterThan( duringFirst );
	} );

	it( 'keeps searching for a plugin it has found until activation is spent', async () => {
		const { result } = render();
		await settle();
		expect( result.current ).toBe( 'searching' );

		for ( let i = 0; i < 6; i++ ) {
			await tick();
		}
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
		expect( result.current ).toBe( 'exhausted' );
	} );

	it( 'does not start an extra attempt when the plugin it acts on changes identity', async () => {
		// The plugin can drop out of the store and come back as a list request lands. Re-reading it must
		// not start a cycle off the interval's schedule, which would spend the retries in a burst.
		const { rerender } = render();
		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );

		rerender( { ...defaults, installedPlugin: null } );
		await settle();
		rerender( { ...defaults, installedPlugin: { ...INSTALLED } } );
		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );

		// The interval still owns every retry after the first.
		await tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'does not poll while disabled', async () => {
		render( { enabled: false } );
		expect( mockIntervalDelay ).toBeNull();
	} );

	it( 'nudges an installed-but-inactive plugin active on a tick', async () => {
		render();
		await tick();
		expect( activatePlugin ).toHaveBeenCalledWith( 1, {
			slug: 'sensei-pro',
			id: 'sensei-pro/sensei-pro',
		} );
	} );

	it( 'does not consume the retry budget while it cannot yet activate', async () => {
		const { rerender } = render( { canActivate: false } );
		await tick();
		await tick();
		expect( activatePlugin ).not.toHaveBeenCalled();

		// Once ready, all attempts remain available.
		rerender( defaults );
		await tick();
		await settle();
		await tick();
		await settle();
		await tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'does not start a new attempt while the previous one is still in flight', async () => {
		render();
		tickNow();
		tickNow();
		tickNow();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'retries a bounded number of times once attempts settle, not forever', async () => {
		render();
		for ( let i = 0; i < 6; i++ ) {
			await tick();
			await settle();
		}
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'refreshes the plugin list right after activating, without waiting for the next poll', async () => {
		render();
		tickNow();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
		const pollFetches = fetchSitePlugins.mock.calls.length;
		await settle();
		expect( fetchSitePlugins.mock.calls.length ).toBeGreaterThan( pollFetches );
		expect( fetchSitePlugins ).toHaveBeenLastCalledWith( 1 );
	} );

	it( 'does not activate when it does not own activation (the step-driven flow does)', async () => {
		render( { ownsActivation: false } );
		await tick();
		expect( activatePlugin ).not.toHaveBeenCalled();
	} );

	it( 'waits to activate until the plugin appears in the refreshed list', async () => {
		const { rerender } = render( { installedPlugin: null } );
		await tick();
		expect( activatePlugin ).not.toHaveBeenCalled();

		rerender( defaults );
		await tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );
} );
