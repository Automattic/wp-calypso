/**
 * @vitest-environment jsdom
 */

import { siteBySlugQuery, siteWordPressMigrationStatusQuery } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteMigrationOverview from '../index';
import type { Site, WordPressMigrationStatus } from '@automattic/api-core';

const siteSlug = 'test-site.wordpress.com';

function createSite( migrationStatus: string | null ): Site {
	return {
		ID: 1,
		slug: siteSlug,
		name: 'Test Site',
		URL: `https://${ siteSlug }`,
		site_migration: {
			migration_status: migrationStatus,
		},
		options: {},
	} as unknown as Site;
}

function mockSiteApi( site: Site ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ siteSlug }` )
		.query( true )
		.reply( 200, site );
}

describe( '<SiteMigrationOverview>', () => {
	test( 'shows migration content when migration is in progress', async () => {
		mockSiteApi( createSite( 'migration-started-diy' ) );

		const { router } = render( <SiteMigrationOverview siteSlug={ siteSlug } /> );

		await waitFor( () => expect( screen.getByText( 'Your migration is underway' ) ).toBeVisible() );

		expect( router.state.location.pathname ).toBe( '/' );
	} );

	test( 'redirects to the overview with a notice after cancellation', async () => {
		mockSiteApi( createSite( 'migration-started-diy' ) );

		const { queryClient, router } = render( <SiteMigrationOverview siteSlug={ siteSlug } /> );

		await waitFor( () => expect( screen.getByText( 'Your migration is underway' ) ).toBeVisible() );

		const historyLength = router.history.length;
		queryClient.setQueryData( siteWordPressMigrationStatusQuery( 1 ).queryKey, {
			status: 'cancelled',
		} as WordPressMigrationStatus );
		mockSiteApi( createSite( 'migration-cancelled-diy' ) );
		await queryClient.invalidateQueries( { queryKey: siteBySlugQuery( siteSlug ).queryKey } );

		await waitFor( () => expect( router.state.location.pathname ).toBe( `/sites/${ siteSlug }` ) );
		expect( router.state.location.search ).toEqual( { flash: 'migration-cancelled' } );
		expect( router.history.length ).toBe( historyLength );
	} );
} );
