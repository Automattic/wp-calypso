/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { SESSION_ACTIVE } from 'calypso/state/support/constants';
import redirectToWpAdminStats from '../redirect-to-wp-admin-stats';

jest.mock( '@automattic/calypso-router', () => ( { redirect: jest.fn() } ) );

const SITE_ID = 123;
const ADMIN_URL = 'https://example.com/wp-admin/';
const STATS_URL = `${ ADMIN_URL }admin.php?page=stats`;

function makeContext( {
	pathname = '/stats/day/example.com',
	querystring = '',
	site = 'example.com',
	support = null,
	jetpack = false,
	statsModuleActive,
	adminUrl = ADMIN_URL,
} = {} ) {
	return {
		pathname,
		querystring,
		params: { site },
		store: {
			getState: () => ( {
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

	test( 'sends the traffic page to wp-admin Stats, keyed by blog ID', () => {
		redirectToWpAdminStats( makeContext(), next );

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'keeps the rest of the route and the query string', () => {
		redirectToWpAdminStats(
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

	test( 'ignores a trailing slash', () => {
		redirectToWpAdminStats( makeContext( { pathname: '/stats/post/42/example.com/' } ), next );

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/post/42/${ SITE_ID }` );
	} );

	test( 'leaves support sessions on the classic page', () => {
		redirectToWpAdminStats( makeContext( { support: SESSION_ACTIVE } ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );

	test( 'sends a route without a site to the Sites list', () => {
		redirectToWpAdminStats( makeContext( { pathname: '/stats/day', site: null } ), next );

		expect( page.redirect ).toHaveBeenCalledWith( '/sites' );
		expect( replace ).not.toHaveBeenCalled();
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'stays when the site has no known wp-admin address', () => {
		redirectToWpAdminStats( makeContext( { adminUrl: null } ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'stays for a Jetpack site with the Stats module off', () => {
		redirectToWpAdminStats( makeContext( { jetpack: true, statsModuleActive: false } ), next );

		expect( next ).toHaveBeenCalled();
		expect( replace ).not.toHaveBeenCalled();
	} );

	test( 'redirects a Jetpack site with the Stats module on', () => {
		redirectToWpAdminStats( makeContext( { jetpack: true, statsModuleActive: true } ), next );

		expect( replace ).toHaveBeenCalledWith( `${ STATS_URL }#!/stats/day/${ SITE_ID }` );
	} );
} );
