/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { SESSION_ACTIVE } from 'calypso/state/support/constants';
import redirectToWpAdminStats from '../redirect-to-wp-admin-stats';

jest.mock( '@automattic/calypso-router', () => ( { redirect: jest.fn() } ) );
jest.mock( 'calypso/state/jetpack/modules/actions', () => ( {
	fetchModuleList: ( siteId ) => ( { type: 'FETCH_MODULE_LIST', siteId } ),
} ) );

const SITE_ID = 123;
const ADMIN_URL = 'https://example.com/wp-admin/';
const STATS_URL = `${ ADMIN_URL }admin.php?page=stats`;

function makeState( { support, jetpack, statsModuleActive, adminUrl } ) {
	return {
		support,
		ui: { selectedSiteId: SITE_ID },
		sites: {
			items: {
				[ SITE_ID ]: {
					ID: SITE_ID,
					URL: 'https://example.com',
					jetpack,
					options: { admin_url: adminUrl },
				},
			},
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

// `fetchedStatsModuleActive` is what the module list request finds: undefined when it fails.
function makeContext( {
	pathname = '/stats/day/example.com',
	querystring = '',
	site = 'example.com',
	support = null,
	jetpack = false,
	statsModuleActive,
	fetchedStatsModuleActive,
	adminUrl = ADMIN_URL,
} = {} ) {
	let state = makeState( { support, jetpack, statsModuleActive, adminUrl } );

	return {
		pathname,
		querystring,
		params: { site },
		store: {
			getState: () => state,
			dispatch: jest.fn( async ( action ) => {
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
		await redirectToWpAdminStats( makeContext(), next );

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
		expect( next ).not.toHaveBeenCalled();
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
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	test( 'sends a route without a site to the Sites list', async () => {
		await redirectToWpAdminStats( makeContext( { pathname: '/stats/day', site: null } ), next );

		expect( page.redirect ).toHaveBeenCalledWith( '/sites' );
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

	test( 'does not ask for modules on a site that is not Jetpack', async () => {
		const context = makeContext();

		await redirectToWpAdminStats( context, next );

		expect( context.store.dispatch ).not.toHaveBeenCalled();
		expect( replace ).toHaveBeenCalled();
	} );
} );
