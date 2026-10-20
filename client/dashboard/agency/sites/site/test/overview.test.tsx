/**
 * @jest-environment jsdom
 */

import { activeAgencyQuery, siteBySlugQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AgencySiteOverview from '../overview';
import type { Agency, AgencySite, Site } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const SITE_SLUG = 'example.wpcomstaging.com';

const mockAgencySite = {
	blog_id: 1,
	url: 'https://example.wpcomstaging.com',
	blogname: 'Example site',
} as unknown as AgencySite;

jest.mock( '../../../../app/router/agency', () => ( {
	...jest.requireActual( '../../../../app/router/agency' ),
	agencySiteRoute: {
		useParams: () => ( { siteSlug: 'example.wpcomstaging.com' } ),
		useLoaderData: () => mockAgencySite,
	},
} ) );

function renderOverview( { role, manageOptions }: { role: string; manageOptions: boolean } ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( siteBySlugQuery( SITE_SLUG ).queryKey, {
		ID: 1,
		slug: SITE_SLUG,
		name: 'Example site',
		capabilities: { manage_options: manageOptions },
	} as unknown as Site );
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 5,
		user: { role, capabilities: [] },
	} as unknown as Agency );

	return render( <AgencySiteOverview />, { queryClient } );
}

describe( '<AgencySiteOverview>', () => {
	test( 'asks a team member without access to request it', async () => {
		renderOverview( { role: 'a4a_manager', manageOptions: false } );

		expect( await screen.findByText( 'Request WP-Admin access' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Learn more/ } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '#allowing-team-members-to-access-wp-admin' )
		);
	} );

	test( 'shows the site to the agency owner', async () => {
		nock( API )
			.get( '/rest/v1.1/sites/1/media-storage' )
			.reply( 200, { max_storage_bytes: 1000, storage_used_bytes: 100 } );
		renderOverview( { role: 'a4a_administrator', manageOptions: false } );

		expect( await screen.findByRole( 'heading', { level: 1 } ) ).toBeVisible();
		expect( screen.queryByText( 'Request WP-Admin access' ) ).not.toBeInTheDocument();
	} );
} );
