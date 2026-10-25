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

const renderButton = (
	actions: NoticeAction[],
	onFollowToggle: () => void = () => {},
	{
		emailVerified = false,
		onFollowSuccess,
	}: { emailVerified?: boolean; onFollowSuccess?: ( following: boolean ) => void } = {}
) => {
	const store = createStore(
		(
			state = {
				currentUser: {
					id: 1,
					user: { email_verified: emailVerified },
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

	const queryClient = makeQueryClient();
	const tree = ( followSuccess?: ( following: boolean ) => void ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<FollowButtonContainer
					siteUrl="https://example.com/feed"
					onFollowToggle={ onFollowToggle }
					onFollowSuccess={ followSuccess }
				/>
			</QueryClientProvider>
		</Provider>
	);
	const result = render( tree( onFollowSuccess ) );

	return {
		...result,
		rerenderWithFollowSuccess: ( followSuccess: ( following: boolean ) => void ) =>
			result.rerender( tree( followSuccess ) ),
	};
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

			const onFollowToggle = jest.fn();
			renderButton( actions, onFollowToggle );
			await userEvent.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

			expect( onFollowToggle ).not.toHaveBeenCalled();
			expect( screen.getByRole( 'button', { name: 'Subscribe' } ) ).toBeVisible();
			expect( verificationNotices( actions ) ).toEqual( [
				expect.objectContaining( {
					notice: expect.objectContaining( {
						text: INSTANT_NOTICE,
						noticeId: 'resend-verification-email',
						button: 'Resend verification email',
					} ),
				} ),
			] );
			await waitFor( () => expect( followScope.isDone() ).toBe( true ) );

			await waitFor( () => expect( verificationNotices( actions ) ).toHaveLength( 2 ) );

			expect( onFollowToggle ).not.toHaveBeenCalled();
			expect( verificationNotices( actions )[ 1 ] ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						text,
						noticeId: 'resend-verification-email',
						button: 'Resend verification email',
					} ),
				} )
			);
		}
	);

	describe( 'onFollowSuccess', () => {
		beforeEach( () => {
			nock( BASE ).persist().get( /.*/ ).query( true ).reply( 200, {
				subscriptions: [],
				total_subscriptions: 0,
				page: 1,
				number: 0,
			} );
		} );

		it( 'is called once the follow request succeeds, not when the button is clicked', async () => {
			const followScope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new' )
				.delay( 250 )
				.reply( 200, {
					subscribed: true,
					subscription: { ID: '123', URL: 'https://example.com/feed' },
				} );
			const onFollowToggle = jest.fn();
			const onFollowSuccess = jest.fn();

			renderButton( [], onFollowToggle, { emailVerified: true, onFollowSuccess } );
			await userEvent.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

			expect( onFollowToggle ).toHaveBeenCalledWith( true );
			expect( onFollowSuccess ).not.toHaveBeenCalled();

			await waitFor( () => expect( followScope.isDone() ).toBe( true ) );
			await waitFor( () => expect( onFollowSuccess ).toHaveBeenCalledWith( true ) );
		} );

		it( 'calls the callback from the click, even if the prop changes before the request finishes', async () => {
			const followScope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new' )
				.delay( 250 )
				.reply( 200, {
					subscribed: true,
					subscription: { ID: '123', URL: 'https://example.com/feed' },
				} );
			const firstOnFollowSuccess = jest.fn();
			const laterOnFollowSuccess = jest.fn();

			const { rerenderWithFollowSuccess } = renderButton( [], jest.fn(), {
				emailVerified: true,
				onFollowSuccess: firstOnFollowSuccess,
			} );
			await userEvent.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );
			rerenderWithFollowSuccess( laterOnFollowSuccess );

			await waitFor( () => expect( followScope.isDone() ).toBe( true ) );
			await waitFor( () => expect( firstOnFollowSuccess ).toHaveBeenCalledWith( true ) );
			expect( laterOnFollowSuccess ).not.toHaveBeenCalled();
		} );

		it( 'is not called when the follow request fails', async () => {
			const followScope = nock( BASE )
				.post( '/rest/v1.1/read/following/mine/new' )
				.reply( 500, { error: 'unknown', message: 'Something went wrong' } );
			const actions: NoticeAction[] = [];
			const onFollowSuccess = jest.fn();

			renderButton( actions, jest.fn(), { emailVerified: true, onFollowSuccess } );
			await userEvent.click( screen.getByRole( 'button', { name: 'Subscribe' } ) );

			await waitFor( () => expect( followScope.isDone() ).toBe( true ) );
			await waitFor( () =>
				expect( actions.some( ( action ) => action.type === 'NOTICE_CREATE' ) ).toBe( true )
			);
			expect( onFollowSuccess ).not.toHaveBeenCalled();
		} );
	} );
} );
