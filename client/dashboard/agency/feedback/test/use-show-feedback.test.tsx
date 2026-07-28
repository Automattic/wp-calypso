/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { AnalyticsProvider } from '../../../app/analytics';
import { FeedbackType } from '../types';
import useShowFeedback from '../use-show-feedback';

function createWrapper() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const Wrapper = function Wrapper( { children }: { children: React.ReactNode } ) {
		return (
			<QueryClientProvider client={ queryClient }>
				<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
					{ children }
				</AnalyticsProvider>
			</QueryClientProvider>
		);
	};
	return { Wrapper, queryClient };
}

describe( 'useShowFeedback', () => {
	test( 'reports not-shown when the type has no timestamps', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/agency' )
			.reply( 200, [ { id: 42, name: 'A', url: 'x' } ] );

		const { result } = renderHook( () => useShowFeedback( FeedbackType.MemberInviteSent ), {
			wrapper: createWrapper().Wrapper,
		} );

		await waitFor( () => expect( result.current.isFeedbackShown ).toBe( false ) );
	} );

	test( 'reports shown when lastSkippedAt is set for the type', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, {
				calypso_preferences: {
					'a4a-feedback': { 'team-member-invite-sent': { lastSkippedAt: 123 } },
				},
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/agency' )
			.reply( 200, [ { id: 42, name: 'A', url: 'x' } ] );

		const { result } = renderHook( () => useShowFeedback( FeedbackType.MemberInviteSent ), {
			wrapper: createWrapper().Wrapper,
		} );

		await waitFor( () => expect( result.current.isFeedbackShown ).toBe( true ) );
	} );

	test( 'reports shown when lastSubmittedAt is set for the type', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, {
				calypso_preferences: {
					'a4a-feedback': { 'team-member-invite-sent': { lastSubmittedAt: 456 } },
				},
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/agency' )
			.reply( 200, [ { id: 42, name: 'A', url: 'x' } ] );

		const { result } = renderHook( () => useShowFeedback( FeedbackType.MemberInviteSent ), {
			wrapper: createWrapper().Wrapper,
		} );

		await waitFor( () => expect( result.current.isFeedbackShown ).toBe( true ) );
	} );

	test( 'submit posts the correct survey payload', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/agency' )
			.reply( 200, [ { id: 42, name: 'A', url: 'x' } ] );

		let capturedSurveyBody: Record< string, unknown > | undefined;
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/marketing/survey', ( body ) => {
				capturedSurveyBody = body;
				return true;
			} )
			.reply( 200, {} );
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/me/preferences' ).reply( 200, {
			calypso_preferences: {},
		} );

		const { Wrapper, queryClient } = createWrapper();
		const { result } = renderHook( () => useShowFeedback( FeedbackType.MemberInviteSent ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.isFeedbackShown ).toBe( false ) );
		await waitFor( () =>
			expect( queryClient.getQueryData( [ 'agency', 'active' ] ) ).toEqual( {
				id: 42,
				name: 'A',
				url: 'x',
			} )
		);

		act( () => {
			result.current.submit( {
				experience: 'good',
				comment: 'nice',
				suggestions: [ 'finding-where-to-invite-my-team-members' ],
			} );
		} );

		await waitFor( () => expect( capturedSurveyBody ).toBeDefined() );

		expect( capturedSurveyBody ).toMatchObject( {
			survey_id: 'a4a-feedback-team-member-invite-sent',
			site_id: 42,
			survey_responses: {
				rating: 'good',
				comment: { text: 'nice' },
				suggestions: { text: 'finding-where-to-invite-my-team-members' },
			},
		} );
	} );

	test( 'submit preserves other feedback types when writing the dismissal preference', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, {
				calypso_preferences: {
					'a4a-feedback': { 'some-other-type': { lastSubmittedAt: 111 } },
				},
			} );
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/agency' )
			.reply( 200, [ { id: 42, name: 'A', url: 'x' } ] );

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/marketing/survey' )
			.reply( 200, {} );

		let capturedPreferenceBody: Record< string, unknown > | undefined;
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				capturedPreferenceBody = body;
				return true;
			} )
			.reply( 200, { calypso_preferences: {} } );

		const { Wrapper, queryClient } = createWrapper();
		const { result } = renderHook( () => useShowFeedback( FeedbackType.MemberInviteSent ), {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current.isFeedbackShown ).toBe( false ) );
		await waitFor( () =>
			expect( queryClient.getQueryData( [ 'agency', 'active' ] ) ).toEqual( {
				id: 42,
				name: 'A',
				url: 'x',
			} )
		);

		act( () => {
			result.current.submit( {
				experience: 'good',
				comment: 'nice',
				suggestions: [ 'finding-where-to-invite-my-team-members' ],
			} );
		} );

		await waitFor( () => expect( capturedPreferenceBody ).toBeDefined() );

		const calypsoPreferences = capturedPreferenceBody?.calypso_preferences as Record<
			string,
			unknown
		>;
		const feedbackPreferences = calypsoPreferences[ 'a4a-feedback' ] as Record<
			string,
			{ lastSubmittedAt?: number }
		>;

		expect( feedbackPreferences[ 'some-other-type' ] ).toEqual( { lastSubmittedAt: 111 } );
		expect( feedbackPreferences[ 'team-member-invite-sent' ]?.lastSubmittedAt ).toEqual(
			expect.any( Number )
		);
	} );
} );
