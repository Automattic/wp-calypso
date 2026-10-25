/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { successNotice } from 'calypso/state/notices/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderFeedHeaderFollow from '../follow';

jest.mock( 'calypso/state/notices/actions', () => ( {
	__esModule: true,
	successNotice: jest.fn( ( text: string, options: { duration: number } ) => ( {
		type: 'NOTICE/SUCCESS',
		text,
		options,
	} ) ),
} ) );
jest.mock( 'calypso/reader/follow-button', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );
jest.mock( 'calypso/blocks/reader-suggested-follows/dialog', () => ( {
	__esModule: true,
	default: jest.fn( () => null ),
} ) );
jest.mock( 'calypso/blocks/reader-site-notification-settings', () => () => null );
jest.mock( 'calypso/reader/recommend-button', () => ( { RecommendButton: () => null } ) );
jest.mock( 'calypso/data/reader/use-feed-recommendations-mutation', () => ( {
	useFeedRecommendationsMutation: () => ( {
		isRecommended: false,
		isUpdating: false,
		toggleRecommended: jest.fn(),
	} ),
} ) );
jest.mock( 'calypso/reader/data/feed', () => ( { useFeedQuery: () => ( { data: undefined } ) } ) );
jest.mock( 'calypso/reader/data/seen-posts', () => ( {
	useCanMarkSeen: () => false,
	useMarkAllAsSeenMutation: () => ( { mutate: jest.fn() } ),
} ) );
jest.mock( 'calypso/reader/data/site-subscriptions', () => ( { useIsSubscribed: () => false } ) );

describe( 'ReaderFeedHeaderFollow', () => {
	const site = { ID: 100, feed_ID: 200, name: 'Test Blog', is_following: false };
	const feed = { feed_ID: 200, feed_URL: 'https://testblog.com/feed', blog_ID: 100 };

	const lastFollowButtonProps = () => jest.mocked( ReaderFollowButton ).mock.lastCall![ 0 ];
	const isDialogVisible = () =>
		( ReaderSuggestedFollowsDialog as jest.Mock ).mock.lastCall[ 0 ].isVisible;

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'opens suggested follows on click without a success notice', () => {
		renderWithProvider( <ReaderFeedHeaderFollow site={ site } feed={ feed } /> );

		act( () => lastFollowButtonProps().onFollowToggle?.( true ) );

		expect( isDialogVisible() ).toBe( true );
		expect( successNotice ).not.toHaveBeenCalled();
	} );

	test( 'shows the subscribed notice once the follow succeeds', () => {
		renderWithProvider( <ReaderFeedHeaderFollow site={ site } feed={ feed } /> );

		act( () => lastFollowButtonProps().onFollowSuccess?.( true ) );

		expect( successNotice ).toHaveBeenCalledWith(
			'Success! You are now subscribed to "Test Blog".',
			{ duration: 3000 }
		);
	} );

	test( 'shows the unsubscribed notice once the unfollow succeeds', () => {
		renderWithProvider(
			<ReaderFeedHeaderFollow site={ { ...site, is_following: true } } feed={ feed } />
		);

		act( () => lastFollowButtonProps().onFollowSuccess?.( false ) );

		expect( successNotice ).toHaveBeenCalledWith(
			'Success! You are now unsubscribed from "Test Blog".',
			{ duration: 3000 }
		);
	} );
} );
