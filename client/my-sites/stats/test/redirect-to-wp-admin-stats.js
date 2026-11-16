/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { isSupportSession } from 'calypso/lib/user/support-user-interop';
import redirectToWpAdminStats from '../redirect-to-wp-admin-stats';

jest.mock( '@automattic/calypso-router', () => ( { current: '' } ) );
jest.mock( 'calypso/lib/user/support-user-interop', () => ( { isSupportSession: jest.fn() } ) );
jest.mock( 'calypso/state/jetpack/modules/actions', () => ( {
	fetchModuleList: ( siteId ) => ( { type: 'FETCH_MODULE_LIST', siteId } ),
} ) );
jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: ( siteFragment ) => ( { type: 'REQUEST_SITE', siteFragment } ),
} ) );

const SITE_ID = 123;
const ADMIN_URL = 'https://example.com/wp-admin/';
const STATS_URL = `${ ADMIN_URL }admin.php?page=stats`;

function makeState( {
	siteLoaded = true,
	jetpack,
	statsModuleActive,
	adminUrl,
	siteOptions,
	siteProps,
} ) {
	return {
		sites: {
			items: siteLoaded
				? {
						[ SITE_ID ]: {
							ID: SITE_ID,
							URL: 'https://example.com',
							jetpack,
							options: { admin_url: adminUrl, ...siteOptions },
							...siteProps,
						},
					}
				: {},
		},
		jetpack: {
			modules: {
				items:
					statsModuleActive === undefined
						? {}
						: { [ SITE_ID ]: { stats: { active: statsModuleActive } } },
			},
		},
	};
}

// `siteLoaded` is whether the site is in state on arrival, and `siteLoadable` whether requesting it
// succeeds. `fetchedStatsModuleActive` is what the module list request finds: undefined when it fails.
function makeContext( {
	pathname = '/stats/day/example.com',
	querystring = '',
	site = 'example.com',
	siteLoaded = true,
	siteLoadable = true,
	jetpack = false,
	statsModuleActive,
	fetchedStatsModuleActive,
	adminUrl = ADMIN_URL,
	siteOptions,
	siteProps,
} = {} ) {
	const siteState = { jetpack, adminUrl, siteOptions, siteProps };
	let state = makeState( { ...siteState, siteLoaded, statsModuleActive } );

	page.current = pathname;

	return {
		path: pathname,
		pathname,
		querystring,
		params: { site },
		store: {
			getState: () => state,
			dispatch: jest.fn( async ( action ) => {
				if ( action.type === 'REQUEST_SITE' ) {
					if ( ! siteLoadable ) {
						throw new Error( 'unknown_blog' );
					}
					state = makeState( { ...siteState, statsModuleActive } );
				}
				if ( action.type === 'FETCH_MODULE_LIST' ) {
					state = makeState( { ...siteState, statsModuleActive: fetchedStatsModuleActive } );
				}
			} ),
		},
	};
}

describe( 'redirectToWpAdminStats()', () => {
	let replace;
	let next;

	beforeEach( () => {
		jest.clearAllMocks();
		isSupportSession.mockReturnValue( false );
		replace = jest.fn();
		next = jest.fn();
		Object.defineProperty( window, 'location', { value: { replace }, writable: true } );
	} );

	test( 'sends the traffic page to wp-admin Stats, keyed by blog ID', async () => {
		const context = makeContext();

		await redirectToWpAdminStats( context, next );

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
		expect( next ).not.toHaveBeenCalled();
		expect( context.store.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'keeps the rest of the route and the query string', async () => {
		await redirectToWpAdminStats(
			makeContext( {
				pathname: '/stats/week/referrers/example.com',
				querystring: 'chartStart=2026-10-01&sb=1',
			} ),
			next
		);

		expect( replace ).toHaveBeenCalledWith(
			`${ STATS_URL }#!/stats/week/referrers/${ SITE_ID }?chartStart=2026-10-01&sb=1`
		);
	} );

	test( 'ignores a trailing slash', async () => {
		await redirectToWpAdminStats(
			makeContext( { pathname: '/stats/post/42/example.com/' } ),
			next
		);

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/post/42/${ SITE_ID }` );
	} );

	test( 'leaves support sessions on the classic page', async () => {
		isSupportSession.mockReturnValue( true );

		await redirectToWpAdminStats( makeContext(), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'leaves the all-sites overview on the classic page', async () => {
		await redirectToWpAdminStats( makeContext( { pathname: '/stats/day', site: null } ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'leaves the purchase page on the classic page', async () => {
		await redirectToWpAdminStats(
			makeContext( { pathname: '/stats/purchase/example.com' } ),
			next
		);

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'leaves the realtime page on the classic page', async () => {
		await redirectToWpAdminStats(
			makeContext( { pathname: '/stats/realtime/example.com' } ),
			next
		);

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'loads a site that is not in state yet before redirecting', async () => {
		const context = makeContext( { siteLoaded: false } );

		await redirectToWpAdminStats( context, next );

		expect( context.store.dispatch ).toHaveBeenCalledWith( {
			type: 'REQUEST_SITE',
			siteFragment: 'example.com',
		} );
		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
	} );

	test( 'hands over to site selection when the site cannot be loaded', async () => {
		await redirectToWpAdminStats( makeContext( { siteLoaded: false, siteLoadable: false } ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'does nothing when the user navigates away while the site loads', async () => {
		const context = makeContext( { siteLoaded: false } );
		const loadSite = context.store.dispatch.getMockImplementation();
		context.store.dispatch.mockImplementation( async ( action ) => {
			await loadSite( action );
			page.current = '/home/example.com';
		} );

		await redirectToWpAdminStats( context, next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'stays when the site has no known wp-admin address', async () => {
		await redirectToWpAdminStats( makeContext( { adminUrl: null } ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'stays for a Jetpack site with the Stats module off', async () => {
		const context = makeContext( { jetpack: true, statsModuleActive: false } );

		await redirectToWpAdminStats( context, next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
		expect( context.store.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'redirects a Jetpack site with the Stats module on', async () => {
		await redirectToWpAdminStats( makeContext( { jetpack: true, statsModuleActive: true } ), next );

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
	} );

	test( 'redirects a Jetpack site whose own module list has Stats on, without asking for it', async () => {
		const context = makeContext( {
			jetpack: true,
			siteOptions: { active_modules: [ 'stats' ] },
		} );

		await redirectToWpAdminStats( context, next );

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
		expect( context.store.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'stays for a Jetpack site whose own module list has Stats off, without asking for it', async () => {
		const context = makeContext( { jetpack: true, siteOptions: { active_modules: [] } } );

		await redirectToWpAdminStats( context, next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
		expect( context.store.dispatch ).not.toHaveBeenCalled();
	} );

	test( 'trusts a loaded module list over the site option', async () => {
		await redirectToWpAdminStats(
			makeContext( {
				jetpack: true,
				statsModuleActive: false,
				siteOptions: { active_modules: [ 'stats' ] },
			} ),
			next
		);

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'asks for the module list before redirecting a Jetpack site it has not loaded', async () => {
		const context = makeContext( { jetpack: true, fetchedStatsModuleActive: true } );

		await redirectToWpAdminStats( context, next );

		expect( context.store.dispatch ).toHaveBeenCalledWith( {
			type: 'FETCH_MODULE_LIST',
			siteId: SITE_ID,
		} );
		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
	} );

	test( 'does nothing when the user navigates away while the module list loads', async () => {
		const context = makeContext( { jetpack: true, fetchedStatsModuleActive: true } );
		const fetchModules = context.store.dispatch.getMockImplementation();
		context.store.dispatch.mockImplementation( async ( action ) => {
			await fetchModules( action );
			page.current = '/home/example.com';
		} );

		await redirectToWpAdminStats( context, next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'stays when the fetched module list has Stats off', async () => {
		await redirectToWpAdminStats(
			makeContext( { jetpack: true, fetchedStatsModuleActive: false } ),
			next
		);

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'stays when the module list cannot be loaded', async () => {
		await redirectToWpAdminStats( makeContext( { jetpack: true } ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test.each( [
		[ 'a domain-only site', { siteOptions: { is_domain_only: true } } ],
		[ 'a site being migrated', { siteProps: { site_migration: { status: 'restoring' } } } ],
		[ 'a DIFM site being built', { siteOptions: { is_difm_lite_in_progress: true } } ],
		[
			'a site whose eCommerce trial expired',
			{ siteProps: { was_ecommerce_trial: true, plan: { product_slug: 'free_plan' } } },
		],
	] )( 'leaves %s to site selection', async ( _, site ) => {
		await redirectToWpAdminStats( makeContext( site ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );
} );
