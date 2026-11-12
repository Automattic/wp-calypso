/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { SESSION_ACTIVE } from 'calypso/state/support/constants';
import redirectToWpAdminStats from '../redirect-to-wp-admin-stats';

jest.mock( '@automattic/calypso-router', () => ( { current: '' } ) );
jest.mock( 'calypso/state/jetpack/modules/actions', () => ( {
	fetchModuleList: ( siteId ) => ( { type: 'FETCH_MODULE_LIST', siteId } ),
} ) );
jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: ( siteFragment ) => ( { type: 'REQUEST_SITE', siteFragment } ),
} ) );

const SITE_ID = 123;
const ADMIN_URL = 'https://example.com/wp-admin/';
const STATS_URL = `${ ADMIN_URL }admin.php?page=stats`;

function makeState( { support, siteLoaded = true, jetpack, statsModuleActive, adminUrl } ) {
	return {
		support,
		sites: {
			items: siteLoaded
				? {
						[ SITE_ID ]: {
							ID: SITE_ID,
							URL: 'https://example.com',
							jetpack,
							options: { admin_url: adminUrl },
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
	support = null,
	siteLoaded = true,
	siteLoadable = true,
	jetpack = false,
	statsModuleActive,
	fetchedStatsModuleActive,
	adminUrl = ADMIN_URL,
} = {} ) {
	let state = makeState( { support, siteLoaded, jetpack, statsModuleActive, adminUrl } );

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
					state = makeState( { support, jetpack, statsModuleActive, adminUrl } );
				}
				if ( action.type === 'FETCH_MODULE_LIST' ) {
					state = makeState( {
						support,
						jetpack,
						statsModuleActive: fetchedStatsModuleActive,
						adminUrl,
					} );
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
		await redirectToWpAdminStats( makeContext( { support: SESSION_ACTIVE } ), next );

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
} );
