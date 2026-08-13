/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import usePluginsThankYouData from '../use-plugins-thank-you-data';
import { THANK_YOU_RECOVERY_INTERVAL_MS } from '../use-thank-you-deadline';

const PLUGIN_SLUG = 'sensei-pro';
const mockDispatch = jest.fn();
let mockState = {
	siteId: 1 as number | null,
	siteSlug: 'example.wordpress.com',
	pluginsOnSite: [ { slug: PLUGIN_SLUG, fetched: true, wporg: true, icon: '' } ] as Array< {
		slug: string;
		fetched: boolean;
		wporg: boolean;
		icon: string;
	} >,
	wporgPlugins: [ { slug: PLUGIN_SLUG } ],
	wporgFetched: [ true ],
	wporgFetching: [ false ],
	activePluginSlugs: new Set< string >(),
	transferStatus: transferStates.COMPLETE as string | null,
	isJetpack: false,
	isAtomic: true,
};

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/components', () => ( { Button: () => null } ) );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );
jest.mock( 'calypso/data/marketplace/use-wpcom-plugins-query', () => ( {
	useWPCOMPlugins: ( slugs: string[] ) =>
		slugs.map( ( slug ) => ( { data: { software_slug: slug } } ) ),
} ) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: ( state: typeof mockState ) => state.transferStatus,
} ) );
jest.mock( 'calypso/state/marketplace/purchase-flow/actions', () => ( {
	pluginInstallationStateChange: jest.fn( () => ( { type: 'PLUGIN_INSTALLATION_STATE_CHANGE' } ) ),
} ) );
jest.mock( 'calypso/state/plugins/installed/actions', () => ( {
	fetchSitePlugins: jest.fn( ( siteId: number ) => ( { type: 'FETCH_SITE_PLUGINS', siteId } ) ),
} ) );
jest.mock( 'calypso/state/plugins/installed/selectors', () => ( {
	getPluginsOnSite: ( state: typeof mockState ) => state.pluginsOnSite,
} ) );
jest.mock( 'calypso/state/plugins/installed/selectors-ts', () => ( {
	isPluginActive: ( state: typeof mockState, _siteId: number, slug: string ) =>
		state.activePluginSlugs.has( slug ),
} ) );
jest.mock( 'calypso/state/plugins/wporg/actions', () => ( {
	fetchPluginData: jest.fn( ( slug: string ) => ( { type: 'FETCH_PLUGIN_DATA', slug } ) ),
} ) );
jest.mock( 'calypso/state/plugins/wporg/selectors', () => ( {
	areFetched: ( state: typeof mockState ) => state.wporgFetched,
	areFetching: ( state: typeof mockState ) => state.wporgFetching,
	getPlugins: ( state: typeof mockState ) => state.wporgPlugins,
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: ( state: typeof mockState ) => state.isAtomic,
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: ( state: typeof mockState ) => state.isJetpack,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: ( state: typeof mockState ) => state.siteId,
	getSelectedSiteSlug: ( state: typeof mockState ) => state.siteSlug,
} ) );
jest.mock( '../marketplace-thank-you-plugin-section', () => ( {
	ThankYouPluginSection: () => null,
} ) );

const defaultState = { ...mockState };
const renderPlugins = ( pluginSlugs: string[] = [ PLUGIN_SLUG ], isRecoveryMode = false ) =>
	renderHook( ( { slugs, recovery } ) => usePluginsThankYouData( slugs, recovery ), {
		initialProps: { slugs: pluginSlugs, recovery: isRecoveryMode },
	} );

describe( 'usePluginsThankYouData', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.setSystemTime( new Date( '2026-08-13T12:00:00Z' ) );
		jest.clearAllMocks();
		mockState = {
			...defaultState,
			pluginsOnSite: [ ...defaultState.pluginsOnSite ],
			wporgPlugins: [ ...defaultState.wporgPlugins ],
			wporgFetched: [ ...defaultState.wporgFetched ],
			wporgFetching: [ ...defaultState.wporgFetching ],
			activePluginSlugs: new Set(),
		};
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'polls installed plugins every three seconds after transfer completion', () => {
		renderPlugins();
		expect( fetchSitePlugins ).toHaveBeenCalledTimes( 1 );

		act( () => jest.advanceTimersByTime( 3000 ) );

		expect( fetchSitePlugins ).toHaveBeenCalledTimes( 2 );
		expect( fetchSitePlugins ).toHaveBeenLastCalledWith( 1 );
	} );

	it( 'does not poll before transfer completion', () => {
		mockState.transferStatus = transferStates.ACTIVE;
		renderPlugins();

		act( () => jest.advanceTimersByTime( 10000 ) );

		expect( fetchSitePlugins ).not.toHaveBeenCalled();
	} );

	it( 'does not poll when all plugins are active', () => {
		mockState.activePluginSlugs.add( PLUGIN_SLUG );
		renderPlugins();

		act( () => jest.advanceTimersByTime( 10000 ) );

		expect( fetchSitePlugins ).not.toHaveBeenCalled();
	} );

	it( 'does not poll when no plugins were purchased', () => {
		renderPlugins( [] );

		act( () => jest.advanceTimersByTime( 10000 ) );

		expect( fetchSitePlugins ).not.toHaveBeenCalled();
	} );

	it( 'accepts the completed status spelling', () => {
		mockState.transferStatus = transferStates.COMPLETED;
		renderPlugins();

		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
	} );

	it( 'uses slow background checks after the page deadline', () => {
		renderPlugins( [ PLUGIN_SLUG ], true );
		jest.mocked( fetchSitePlugins ).mockClear();

		act( () => jest.advanceTimersByTime( THANK_YOU_RECOVERY_INTERVAL_MS - 1 ) );
		expect( fetchSitePlugins ).not.toHaveBeenCalled();
		act( () => jest.advanceTimersByTime( 1 ) );
		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
	} );

	it( 'offers an immediate plugin refresh for explicit retry', () => {
		const { result } = renderPlugins();
		jest.mocked( fetchSitePlugins ).mockClear();

		act( () => result.current.retry() );

		expect( fetchSitePlugins ).toHaveBeenCalledWith( 1 );
	} );
} );
