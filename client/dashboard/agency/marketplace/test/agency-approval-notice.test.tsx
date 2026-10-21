/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { queryClient, rawUserPreferencesQuery } from '@automattic/api-queries';
// eslint-disable-next-line no-restricted-imports -- Preload the real Help Center store before timing the interaction.
import { HelpCenter } from '@automattic/data-stores';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { select } from '@wordpress/data';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencyApprovalNotice from '../agency-approval-notice';
import type { Agency } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function mockPreferences( preferences: Record< string, unknown > = {} ) {
	nock( API )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

function agency( approval_status: Agency[ 'approval_status' ], createdDaysAgo = 1 ) {
	return {
		id: 1,
		approval_status,
		created_at: new Date( Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000 ).toISOString(),
	} as Agency;
}

// The dismissal writes back through the shared query client, so the tests
// render with it.
function renderNotice( value: Agency ) {
	return render( <AgencyApprovalNotice agency={ value } />, { queryClient } );
}

describe( '<AgencyApprovalNotice>', () => {
	beforeEach( () => {
		nock.cleanAll();
		queryClient.clear();
	} );

	test( 'opens the contact form for a rejected agency', async () => {
		HelpCenter.register();
		mockPreferences();
		renderNotice( agency( 'rejected' ) );

		await userEvent.click( await screen.findByRole( 'button', { name: 'contact support' } ) );

		await waitFor( () => {
			const helpCenter = select( 'automattic/help-center' );
			expect( helpCenter.isHelpCenterShown() ).toBe( true );
			expect( helpCenter.getNavigateToRoute()?.route ).toBe( '/contact-form' );
		} );
	} );

	test( 'welcomes a newly approved agency and remembers dismissal after reloading', async () => {
		mockPreferences();
		const save = nock( API )
			.post(
				'/rest/v1.1/me/preferences',
				( body ) => body?.calypso_preferences?.[ 'a4a-agency-approval-notice-dismissed' ] === true
			)
			.reply( 200, {
				calypso_preferences: { 'a4a-agency-approval-notice-dismissed': true },
			} );
		const { unmount } = renderNotice( agency( 'approved' ) );

		expect( await screen.findByText( /Your application has been approved/ ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );
		await waitFor( () => {
			expect( save.isDone() ).toBe( true );
			expect( queryClient.isMutating() ).toBe( 0 );
			expect( screen.queryByText( /Your application has been approved/ ) ).not.toBeInTheDocument();
		} );

		unmount();
		nock.cleanAll();
		queryClient.clear();

		mockPreferences( { 'a4a-agency-approval-notice-dismissed': true } );
		const { container } = renderNotice( agency( 'approved' ) );

		await waitFor( () =>
			expect( queryClient.getQueryState( rawUserPreferencesQuery().queryKey )?.status ).toBe(
				'success'
			)
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'hides the welcome for agencies created more than a week ago', async () => {
		mockPreferences();
		const { container } = renderNotice( agency( 'approved', 8 ) );

		await waitFor( () =>
			expect( queryClient.getQueryState( rawUserPreferencesQuery().queryKey )?.status ).toBe(
				'success'
			)
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );
