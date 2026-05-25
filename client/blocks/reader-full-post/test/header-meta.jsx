/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import UserAvatar from 'calypso/blocks/user-avatar';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import ReaderFullPostHeaderMeta from '../header-meta';

jest.mock( '@automattic/components', () => ( {
	TimeSince: () => null,
} ) );

jest.mock( 'calypso/blocks/user-avatar', () => jest.fn( () => null ) );

jest.mock( 'calypso/state/reader/feeds/selectors', () => ( {
	getFeed: jest.fn(),
} ) );

jest.mock( 'calypso/reader/components/achievements/author-achievement-badges', () => ( {
	AuthorAchievementBadges: () => null,
} ) );

const createMockStore = () => {
	const reducer = ( state = {} ) => state;
	return createStore( reducer );
};

const renderHeaderMeta = ( { post, author, siteName, feedId, siteId } = {} ) => {
	const store = createMockStore();
	return render(
		<Provider store={ store }>
			<ReaderFullPostHeaderMeta
				post={ post }
				author={ author }
				siteName={ siteName }
				feedId={ feedId }
				siteId={ siteId }
			/>
		</Provider>
	);
};

describe( 'ReaderFullPostHeaderMeta avatar fallback', () => {
	const testAuthor = { name: 'Test Author', avatar_URL: 'https://example.com/author-avatar.png' };

	beforeEach( () => {
		jest.clearAllMocks();
		getFeed.mockReturnValue( undefined );
	} );

	it( 'keeps author avatar when one already exists', () => {
		getFeed.mockReturnValue( {
			site_icon: 'https://example.com/site-icon.png',
		} );

		renderHeaderMeta( {
			author: testAuthor,
			post: { is_external: true },
		} );

		const avatarProps = UserAvatar.mock.calls[ 0 ][ 0 ];
		expect( avatarProps.user.avatar_URL ).toBe( 'https://example.com/author-avatar.png' );
	} );

	it( 'uses feed site_icon when author avatar is missing for external posts', () => {
		getFeed.mockReturnValue( {
			site_icon: 'https://example.com/site-icon.png',
			image: 'https://example.com/feed-image.png',
		} );

		renderHeaderMeta( {
			post: { is_external: true },
			author: { ...testAuthor, avatar_URL: undefined },
		} );

		const avatarProps = UserAvatar.mock.calls[ 0 ][ 0 ];
		expect( avatarProps.user.avatar_URL ).toBe( 'https://example.com/site-icon.png' );
	} );

	it( 'falls back to feed image when feed site_icon is unavailable', () => {
		getFeed.mockReturnValue( {
			image: 'https://example.com/feed-image.png',
		} );

		renderHeaderMeta( {
			post: { is_external: true },
			author: { ...testAuthor, avatar_URL: undefined },
		} );

		const avatarProps = UserAvatar.mock.calls[ 0 ][ 0 ];
		expect( avatarProps.user.avatar_URL ).toBe( 'https://example.com/feed-image.png' );
	} );
} );
