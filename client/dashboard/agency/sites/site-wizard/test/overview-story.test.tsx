/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import SitesOverviewStory from '../overview-story';

const BASE = 'https://public-api.wordpress.com';

test( 'opens the assigned scheduling link only after choosing to contact the partner manager', async () => {
	nock( BASE )
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 123, tier: { id: 'pro-agency-partner' } } ] );
	const scheduling = nock( BASE )
		.get( '/wpcom/v2/agency/123/schedule-call-link' )
		.reply( 200, JSON.stringify( 'https://example.com/agency-call' ), {
			'Content-Type': 'application/json',
		} );
	const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
	try {
		const { recordTracksEvent } = render( <SitesOverviewStory /> );
		expect( await screen.findByText( 'Your partner manager' ) ).toBeVisible();
		expect( scheduling.isDone() ).toBe( false );
		expect( open ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'button', { name: 'Schedule a call' } ) );
		await waitFor( () =>
			expect( open ).toHaveBeenCalledWith( 'https://example.com/agency-call', '_blank' )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_sites_migration_schedule_call_click',
			{ agency_tier: 'pro-agency-partner' }
		);
	} finally {
		open.mockRestore();
	}
} );

test( 'offers agency-team help when a dedicated partner manager is not included', async () => {
	const agency = nock( BASE )
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 123, tier: { id: 'emerging-partner' } } ] );
	render( <SitesOverviewStory /> );
	await waitFor( () => expect( agency.isDone() ).toBe( true ) );
	expect( screen.getByText( 'Your agency team' ) ).toBeVisible();
	expect( screen.queryByText( 'Your partner manager' ) ).not.toBeInTheDocument();
	expect( screen.getByRole( 'button', { name: 'Schedule a call' } ) ).toBeVisible();
} );
