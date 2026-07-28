/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import EarnFeedback from '../index';

const mockNavigate = jest.fn();

let mockSearch: { type?: string; returnTo?: string; email?: string } = {};

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '../../../app/router/agency', () => ( {
	...jest.requireActual( '../../../app/router/agency' ),
	feedbackRoute: {
		useSearch: () => mockSearch,
	},
} ) );

function mockPreferences( feedbackByType: Record< string, unknown > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: { 'a4a-feedback': feedbackByType } } );
}

function mockAgency() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 42 } ] );
}

describe( '<EarnFeedback>', () => {
	beforeEach( () => {
		mockNavigate.mockClear();
		mockSearch = {};
	} );

	test( 'renders the survey title for a known, unshown type', async () => {
		mockSearch = { type: 'team-member-invite-sent', returnTo: '/team', email: 'a@b.com' };
		mockPreferences();
		mockAgency();

		render( <EarnFeedback /> );

		await waitFor( () => expect( screen.getByText( 'Invite emailed!' ) ).toBeVisible() );
	} );

	test( 'redirects to returnTo for an unknown type', async () => {
		mockSearch = { type: 'not-a-real-type', returnTo: '/team' };
		mockPreferences();
		mockAgency();

		render( <EarnFeedback /> );

		await waitFor( () => expect( mockNavigate ).toHaveBeenCalledWith( { to: '/team' } ) );
		expect( screen.queryByText( 'Invite emailed!' ) ).not.toBeInTheDocument();
	} );

	test( 'redirects to /overview when returnTo is missing and type is missing', async () => {
		mockSearch = {};
		mockPreferences();
		mockAgency();

		render( <EarnFeedback /> );

		await waitFor( () => expect( mockNavigate ).toHaveBeenCalledWith( { to: '/overview' } ) );
		expect( screen.queryByText( 'Invite emailed!' ) ).not.toBeInTheDocument();
	} );

	test( 'redirects to returnTo when the survey was already shown', async () => {
		mockSearch = { type: 'team-member-invite-sent', returnTo: '/team' };
		mockPreferences( { 'team-member-invite-sent': { lastSubmittedAt: 123 } } );
		mockAgency();

		render( <EarnFeedback /> );

		// The known config still renders while the preferences query loads (there's
		// no synchronous way to know it was already shown), but once it resolves the
		// effect fires and navigates away.
		await waitFor( () => expect( mockNavigate ).toHaveBeenCalledWith( { to: '/team' } ) );
	} );
} );
