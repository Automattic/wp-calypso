/**
 * @vitest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { createRouter, defaultParseSearch } from '@tanstack/react-router';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { rootRoute } from '../root';
import {
	createSitesRoutes,
	siteBackupsRoute,
	siteLogsRoute,
	siteMigrationShareAccessRoute,
} from '../sites';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	name: 'Test Site',
};

beforeEach( () => {
	queryClient.clear();
} );

describe( 'date range routes search', () => {
	test.each( [
		[ 'siteLogsRoute', siteLogsRoute ],
		[ 'siteBackupsRoute', siteBackupsRoute ],
	] )( '%s normalizes millisecond from/to params to seconds', ( _, route ) => {
		const validateSearch = route.options.validateSearch as unknown as (
			search: Record< string, unknown >
		) => { from?: number; to?: number };

		const search = validateSearch( defaultParseSearch( '?from=1729987200000&to=1730159999000' ) );

		expect( search ).toMatchObject( { from: 1729987200, to: 1730159999 } );
	} );
} );

test( 'returns to the migration overview when Share access cannot read the site', async () => {
	const config = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, sites: true },
	};
	createRouter( {
		routeTree: rootRoute.addChildren( createSitesRoutes( config ) ),
		context: { config },
	} );

	const request = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 404, { error: 'unknown_blog', message: 'Unknown site' } );
	const beforeLoad = siteMigrationShareAccessRoute.options.beforeLoad as unknown as ( options: {
		cause: 'enter';
		params: { siteSlug: string };
	} ) => Promise< unknown >;

	await expect(
		beforeLoad( { cause: 'enter', params: { siteSlug: site.slug } } )
	).rejects.toMatchObject( {
		options: { to: '/sites/$siteSlug/migration-overview', params: { siteSlug: site.slug } },
	} );
	expect( request.isDone() ).toBe( true );
} );
