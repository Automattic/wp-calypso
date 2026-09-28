/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

function agency( approval_status: Agency[ 'approval_status' ], createdDaysAgo: number | null = 1 ) {
	return {
		id: 1,
		approval_status,
		created_at:
			createdDaysAgo === null
				? undefined
				: new Date( Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000 ).toISOString(),
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

	test( 'tells a pending agency what is locked', async () => {
		mockPreferences();
		renderNotice( agency( 'pending' ) );

		expect( await screen.findByText( /While we review your agency/ ) ).toBeVisible();
	} );

	test( 'points a rejected agency to support', async () => {
		mockPreferences();
		renderNotice( agency( 'rejected' ) );

		expect( await screen.findByText( /We have not approved your application/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'contact support' } ) ).toBeVisible();
	} );

	test( 'welcomes a newly approved agency until dismissed', async () => {
		mockPreferences();
		const save = nock( API )
			.post(
				'/rest/v1.1/me/preferences',
				( body ) => body?.calypso_preferences?.[ 'a4a-agency-approval-notice-dismissed' ] === true
			)
			.reply( 200, {
				calypso_preferences: { 'a4a-agency-approval-notice-dismissed': true },
			} );
		renderNotice( agency( 'approved' ) );

		expect( await screen.findByText( /Your application has been approved/ ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );
		await waitFor( () => expect( save.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( screen.queryByText( /Your application has been approved/ ) ).not.toBeInTheDocument()
		);
	} );

	test( 'welcomes an approved agency whose creation date is unknown', async () => {
		mockPreferences();
		renderNotice( agency( 'approved', null ) );

		expect( await screen.findByText( /Your application has been approved/ ) ).toBeVisible();
	} );

	test( 'says nothing to an agency approved more than a week ago', async () => {
		mockPreferences();
		const { container } = renderNotice( agency( 'approved', 8 ) );

		await waitFor( () => expect( nock.pendingMocks() ).toHaveLength( 0 ) );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'stays dismissed', async () => {
		mockPreferences( { 'a4a-agency-approval-notice-dismissed': true } );
		const { container } = renderNotice( agency( 'approved' ) );

		await waitFor( () => expect( nock.pendingMocks() ).toHaveLength( 0 ) );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
