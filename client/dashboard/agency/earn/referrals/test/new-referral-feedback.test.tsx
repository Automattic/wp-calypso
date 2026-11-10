/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import NewReferralFeedback from '../new-referral-feedback';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

const mockUseSearch = jest.fn();
jest.mock( '../../../../app/router/agency', () => ( {
	earnReferralsRoute: { useSearch: () => mockUseSearch() },
} ) );

function mockApi( feedback: Record< string, unknown > = {} ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: { 'a4a-feedback': feedback } } )
		.persist();
}

describe( '<NewReferralFeedback>', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'asks about the first referral sent to a client', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			flow_type: 'send',
		} );
		mockApi();
		render( <NewReferralFeedback /> );

		const survey = await screen.findByRole( 'dialog', {
			name: 'Well done! You sent your first referral!',
		} );
		expect( survey ).toHaveTextContent( 'We emailed your referral order to client@example.com.' );
	} );

	test( 'asks about the first referral link that was copied', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			flow_type: 'copy',
		} );
		mockApi();
		render( <NewReferralFeedback /> );

		const survey = await screen.findByRole( 'dialog', {
			name: 'Well done! You created your first referral!',
		} );
		expect( survey ).toHaveTextContent( 'Your referral order for client@example.com is ready.' );
	} );

	test( 'does not ask a partner who already skipped it', async () => {
		mockUseSearch.mockReturnValue( {
			new_referral_order_email: 'client@example.com',
			flow_type: 'send',
		} );
		mockApi( { 'referral-completed': { lastSkippedAt: 1757000000000 } } );
		const { queryClient } = render( <NewReferralFeedback /> );

		await waitFor( () => expect( queryClient.isFetching() ).toBe( 0 ) );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
