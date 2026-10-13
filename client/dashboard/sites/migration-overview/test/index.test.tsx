/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteMigrationOverview from '../index';
import type { Site } from '@automattic/api-core';

const mockNavigate = jest.fn();

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

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
	beforeEach( () => {
		mockNavigate.mockClear();
	} );

	test( 'shows migration content when migration is in progress', async () => {
		mockSiteApi( createSite( 'migration-started-diy' ) );

		render( <SiteMigrationOverview siteSlug={ siteSlug } /> );

		await waitFor( () =>
			expect( screen.getByText( 'Your migration is underway' ) ).toBeVisible()
		);

		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	test( 'redirects to site overview when migration is no longer in progress', async () => {
		mockSiteApi( createSite( 'migration-started-diy' ) );

		const { queryClient } = render( <SiteMigrationOverview siteSlug={ siteSlug } /> );

		await waitFor( () =>
			expect( screen.getByText( 'Your migration is underway' ) ).toBeVisible()
		);

		// Simulate migration completing: update the cached site data
		mockSiteApi( createSite( null ) );
		await queryClient.invalidateQueries( { queryKey: [ 'site-by-slug', siteSlug ] } );

		await waitFor( () =>
			expect( mockNavigate ).toHaveBeenCalledWith( {
				to: '/sites/$siteSlug',
				params: { siteSlug },
				replace: true,
				viewTransition: false,
			} )
		);
	} );
} );
