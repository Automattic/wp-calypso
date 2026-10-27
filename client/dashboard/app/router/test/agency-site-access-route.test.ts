/**
 * @jest-environment jsdom
 */

import { activeAgencyQuery, queryClient, siteBySlugQuery } from '@automattic/api-queries';
import { createRouter } from '@tanstack/react-router';
import { agencySiteRoute, createAgencyRoutes } from '../agency';
import { rootRoute } from '../root';
import type { Agency, Site } from '@automattic/api-core';

const SITE_SLUG = 'example.wpcomstaging.com';

function matchPath( pathname: string ) {
	const router = createRouter( {
		routeTree: rootRoute.addChildren( createAgencyRoutes() ),
		basepath: '/',
	} as never ) as unknown as {
		matchRoutes: ( location: {
			pathname: string;
			search: Record< string, unknown >;
		} ) => Array< { routeId: string; staticData?: Record< string, unknown > } >;
	};

	return router.matchRoutes( { pathname, search: {} } );
}

function runSiteGuard( pathname: string ) {
	const beforeLoad = agencySiteRoute.options.beforeLoad as unknown as ( options: {
		cause: string;
		params: { siteSlug: string };
		matches: ReturnType< typeof matchPath >;
	} ) => Promise< void >;

	return beforeLoad( {
		cause: 'enter',
		params: { siteSlug: SITE_SLUG },
		matches: matchPath( pathname ),
	} );
}

function setUp( { role, manageOptions }: { role: string; manageOptions: boolean } ) {
	queryClient.setQueryData( siteBySlugQuery( SITE_SLUG ).queryKey, {
		ID: 1,
		slug: SITE_SLUG,
		capabilities: { manage_options: manageOptions },
	} as unknown as Site );
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 5,
		user: { role, capabilities: [] },
	} as unknown as Agency );
}

describe( 'agencySiteRoute access', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	test( 'sends a team member without access to the site overview', async () => {
		setUp( { role: 'a4a_manager', manageOptions: false } );

		const redirect = await runSiteGuard( `/sites/${ SITE_SLUG }/backups` ).catch(
			( error ) => error
		);

		expect( redirect ).toMatchObject( { isRedirect: true, to: `/sites/${ SITE_SLUG }` } );
		expect( redirect.search ).toBeUndefined();
	} );

	test( 'keeps a team member without access on the site overview', async () => {
		setUp( { role: 'a4a_manager', manageOptions: false } );

		await expect( runSiteGuard( `/sites/${ SITE_SLUG }` ) ).resolves.toBeUndefined();
	} );

	test( 'lets a team member with access through', async () => {
		setUp( { role: 'a4a_manager', manageOptions: true } );

		await expect( runSiteGuard( `/sites/${ SITE_SLUG }/backups` ) ).resolves.toBeUndefined();
	} );

	test( 'does not restrict the agency owner', async () => {
		setUp( { role: 'a4a_administrator', manageOptions: false } );

		await expect( runSiteGuard( `/sites/${ SITE_SLUG }/backups` ) ).resolves.toBeUndefined();
	} );
} );
