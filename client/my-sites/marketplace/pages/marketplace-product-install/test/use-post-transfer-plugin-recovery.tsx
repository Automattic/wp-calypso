/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { usePostTransferPluginRecovery } from '../use-post-transfer-plugin-recovery';

const mockDispatch = jest.fn();
const mockStore = { getState: () => ( {} ) };
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useStore: () => mockStore,
} ) );
// What the refreshed plugin list says, which is what the hook decides on.
const mockIsPluginActive = jest.fn( () => false );
jest.mock( 'calypso/state/plugins/installed/selectors-ts', () => ( {
	isPluginActive: () => mockIsPluginActive(),
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

const INSTALLED = { slug: 'sensei-pro', id: 'sensei-pro/sensei-pro', active: false };

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
// A tick refreshes the plugin list and only then decides, so let those promises settle before
// asserting. `settle` is kept separate for the tests that assert on a tick still in flight.
const settle = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
const startTick = () => mockIntervalCallback?.();
const tick = async () => {
	startTick();
	await settle();
};

describe( 'usePostTransferPluginRecovery', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsPluginActive.mockReturnValue( false );
		mockIntervalCallback = null;
		mockIntervalDelay = null;
	} );

	it( 'polls the site plugins on an interval while enabled', async () => {
		render( { installedPlugin: null } );
		expect( mockIntervalDelay ).toBe( 3000 );
		await tick();
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
	} );

	it( 'does not poll while disabled', () => {
		render( { enabled: false } );
		expect( mockIntervalDelay ).toBeNull();
	} );

	it( 'nudges an installed-but-inactive plugin active on a tick', async () => {
		render();
		await tick();
		// The plugin goes over as the store has it, so activatePlugin can read `active` off it.
		expect( activatePlugin ).toHaveBeenCalledWith( 1, INSTALLED );
	} );

	it( 'refreshes the plugin list before deciding whether to activate', async () => {
		render();
		startTick();
		// The refresh is dispatched up front; the activation waits on its result.
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
		expect( activatePlugin ).not.toHaveBeenCalled();

		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not activate a plugin the refreshed list already reports active', async () => {
		mockIsPluginActive.mockReturnValue( true );
		render();
		await tick();
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
		expect( activatePlugin ).not.toHaveBeenCalled();
	} );

	// The endpoint may not be able to report the benign already-active case, in which case a
	// redundant activation comes back as a plain failure and the plugin stays inactive in the props
	// this hook was rendered with. The refreshed list is what settles it either way.
	it( 'stops re-activating once the refreshed list reports active, even while the props say otherwise', async () => {
		render();
		await tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );

		// No rerender: the failed activation left `active` false on the props, as it would in the
		// browser. Only the refreshed list knows better.
		mockIsPluginActive.mockReturnValue( true );
		await tick();
		await tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not consume the retry budget while it cannot yet activate', async () => {
		const { rerender } = render( { canActivate: false } );
		await tick();
		await tick();
		expect( activatePlugin ).not.toHaveBeenCalled();

		// Once ready, all attempts remain available.
		rerender( defaults );
		await tick();
		await tick();
		await tick();
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'does not start a new attempt while the previous one is still in flight', () => {
		render();
		startTick();
		startTick();
		startTick();
		expect( activatePlugin ).not.toHaveBeenCalled();
	} );

	it( 'retries a bounded number of times once attempts settle, not forever', async () => {
		render();
		for ( let i = 0; i < 6; i++ ) {
			await tick();
		}
		expect( activatePlugin ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'refreshes the plugin list right after activating, without waiting for the next poll', async () => {
		render();
		startTick();
		const pollFetches = fetchSitePlugins.mock.calls.length;
		await settle();
		expect( activatePlugin ).toHaveBeenCalledTimes( 1 );
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
