/**
 * @jest-environment jsdom
 *
 * Run: yarn test-client client/dashboard/agency/earn/migrations/test/index.test.tsx
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import EarnMigrations from '../index';

// Empty-state copy rendered by MigrationsCommissionsContent when there are no
// tagged sites (regardless of eligibility).
const EMPTY_STATE_HEADING = 'View your migrated websites and commissions right here.';
const TAG_SITES_BUTTON = 'Tag sites for commission';

// A `start_date` inside the incentive gap makes the agency ineligible to tag;
// an absent `start_date` makes it eligible.
function mockAgency( startDate?: string ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{
				id: 1,
				name: 'Test Agency',
				third_party: startDate ? { pressable: { usage: { start_date: startDate } } } : {},
			},
		] );
}

function mockTaggedSites() {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/wpcom/v2/agency/1/sites' )
		.query( true )
		.reply( 200, [] );
}

describe( '<EarnMigrations>', () => {
	beforeEach( () => {
		// Baseline endpoints the dashboard providers resolve on mount.
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.2/read/teams' )
			.query( true )
			.reply( 200, { teams: [] } );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/rest/v1.3/me/sites' )
			.query( true )
			.reply( 200, { sites: [], total: 0 } );
	} );

	test( 'shows the empty state and the tag-sites action when the agency is eligible', async () => {
		mockAgency();
		mockTaggedSites();

		render( <EarnMigrations /> );

		expect( await screen.findByText( EMPTY_STATE_HEADING ) ).toBeVisible();
		expect( await screen.findByRole( 'button', { name: TAG_SITES_BUTTON } ) ).toBeVisible();
	} );

	test( 'hides the tag-sites action when the agency is not eligible', async () => {
		mockAgency( '2025-08-11' );
		mockTaggedSites();

		render( <EarnMigrations /> );

		expect( await screen.findByText( EMPTY_STATE_HEADING ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: TAG_SITES_BUTTON } ) ).not.toBeInTheDocument();
	} );
} );
