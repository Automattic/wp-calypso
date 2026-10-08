/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import FollowButtonContainer from '../index';

const BASE = 'https://public-api.wordpress.com';
const INSTANT_NOTICE = 'Please verify your email before subscribing.';

type NoticeAction = {
	type: string;
	notice?: { text?: string; noticeId?: string; button?: string };
};

const makeQueryClient = () =>
	new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );

const renderButton = ( actions: NoticeAction[] ) => {
	const store = createStore(
		(
			state = {
				currentUser: {
					id: 1,
					user: { email_verified: false },
				},
			}
		) => {
			return state;
		}
	);
	const dispatch = store.dispatch;
	store.dispatch = ( action ) => {
		actions.push( action as NoticeAction );
		return dispatch( action );
	};

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ makeQueryClient() }>
				<FollowButtonContainer siteUrl="https://example.com/feed" onFollowToggle={ () => {} } />
			</QueryClientProvider>
		</Provider>
	);
};

const verificationNotices = ( actions: NoticeAction[] ) =>
	actions.filter(
		( action ) =>
			action.type === 'NOTICE_CREATE' && action.notice?.noticeId === 'resend-verification-email'
	);

describe( 'FollowButtonContainer', () => {
	afterEach( () => nock.cleanAll() );

	it.each( [
		{
			outcome: 'held until the email is verified',
			data: { pending_subscription: true },
			text: 'Please verify your email before subscribing. We will subscribe you once you do.',
		},
		{
			outcome: 'not subscribed',
			data: { pending_subscription: false },
			text: 'Please verify your email before subscribing. This site was not subscribed.',
		},
	] )(
		'asks an unverified user to verify immediately, then updates the notice when the follow is $outcome',
		async ( { data, text } ) => {
			const actions: NoticeAction[] = [];
			nock( BASE ).get( '/rest/v1.2/read/following/mine' ).query( true ).reply( 200, {
				subscriptions: [],
				total_subscriptions: 0,
				page: 1,
				number: 0,
			} );
			const followScope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new' )
				.delay( 250 )
				.reply( 400, {
					error: 'email_unverified',
					message: 'server message',
					data,
				} );

			renderButton( actions );
			await userEvent.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

			expect( verificationNotices( actions ) ).toEqual( [
				expect.objectContaining( {
					notice: expect.objectContaining( {
						text: INSTANT_NOTICE,
						noticeId: 'resend-verification-email',
						button: 'Resend verification email',
					} ),
				} ),
			] );
			expect( followScope.isDone() ).toBe( true );

			await waitFor( () => expect( verificationNotices( actions ) ).toHaveLength( 2 ) );

			expect( verificationNotices( actions )[ 1 ] ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						text,
						noticeId: 'resend-verification-email',
						button: 'Resend verification email',
					} ),
				} )
			);
			expect( followScope.isDone() ).toBe( true );
		}
	);
} );
