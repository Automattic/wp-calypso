/**
 * @jest-environment jsdom
 */
import { readFeedQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import UserAvatar from 'calypso/blocks/user-avatar';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderFullPostHeaderMeta from '../header-meta';

jest.mock( '@automattic/components', () => ( {
	TimeSince: () => null,
} ) );

jest.mock( 'calypso/blocks/user-avatar', () => jest.fn( () => null ) );

jest.mock( 'calypso/reader/components/achievements/author-achievement-badges', () => ( {
	AuthorAchievementBadges: () => null,
} ) );

const renderHeaderMeta = ( { post, author, siteName, feedId = 123, siteId, feed } = {} ) => {
	const queryClient = new QueryClient();
	if ( feed ) {
		queryClient.setQueryData( readFeedQuery( feedId ).queryKey, feed );
	}
	return renderWithProvider(
		<ReaderFullPostHeaderMeta
			post={ post }
			author={ author }
			siteName={ siteName }
			feedId={ feedId }
			siteId={ siteId }
		/>,
		{ queryClient }
	);
};

describe( 'ReaderFullPostHeaderMeta avatar fallback', () => {
	const testAuthor = { name: 'Test Author', avatar_URL: 'https://example.com/author-avatar.png' };

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'keeps author avatar when one already exists', () => {
		renderHeaderMeta( {
			author: testAuthor,
			post: { is_external: true },
			feed: { feed_ID: 123, blog_ID: 0, site_icon: 'https://example.com/site-icon.png' },
		} );

		const avatarProps = UserAvatar.mock.calls[ 0 ][ 0 ];
		expect( avatarProps.user.avatar_URL ).toBe( 'https://example.com/author-avatar.png' );
	} );

	it( 'uses feed site_icon when author avatar is missing for external posts', () => {
		renderHeaderMeta( {
			post: { is_external: true },
			author: { ...testAuthor, avatar_URL: undefined },
			feed: {
				feed_ID: 123,
				blog_ID: 0,
				site_icon: 'https://example.com/site-icon.png',
				image: 'https://example.com/feed-image.png',
			},
		} );

		const avatarProps = UserAvatar.mock.calls[ 0 ][ 0 ];
		expect( avatarProps.user.avatar_URL ).toBe( 'https://example.com/site-icon.png' );
	} );

	it( 'falls back to feed image when feed site_icon is unavailable', () => {
		renderHeaderMeta( {
			post: { is_external: true },
			author: { ...testAuthor, avatar_URL: undefined },
			feed: { feed_ID: 123, blog_ID: 0, image: 'https://example.com/feed-image.png' },
		} );

		const avatarProps = UserAvatar.mock.calls[ 0 ][ 0 ];
		expect( avatarProps.user.avatar_URL ).toBe( 'https://example.com/feed-image.png' );
	} );
} );
