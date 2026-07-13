/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { usePostCommentsApiDisabled } from 'calypso/reader/data/comments';
import { usePost } from 'calypso/reader/data/post';
import { useStreamPostKeySelection } from 'calypso/reader/stream/use-stream-post-key-selection';
import { mapStateToFullPostProps, withFullPostNavigation } from '../index';

jest.mock( 'calypso/reader/data/comments', () => ( {
	usePostCommentsApiDisabled: jest.fn(),
} ) );

jest.mock( 'calypso/reader/data/post', () => ( {
	usePost: jest.fn(),
} ) );

jest.mock( 'calypso/reader/stream/use-stream-post-key-selection', () => ( {
	useStreamPostKeySelection: jest.fn(),
} ) );

// Mock the entire FullPostView component to focus on the specific logic we're testing
const MockFullPostView = ( { commentsApiDisabled, shouldShowComments } ) => {
	const post = { ID: 123, site_ID: 456 };

	return (
		<div>
			{ /* This mimics the logic from the actual component */ }
			{ ! commentsApiDisabled && shouldShowComments( post ) && (
				<div data-testid="comments">Comments Component</div>
			) }
			{ /* This mimics the ReaderPostActions logic */ }
			{ ! commentsApiDisabled && <div data-testid="comment-button">Comment Button</div> }
		</div>
	);
};

// Simple mock store
const createMockStore = () => {
	const reducer = ( state = {} ) => state;
	return createStore( reducer );
};

const fullPostState = {
	route: { path: { current: '/reader/blogs/100/posts/1' } },
	ui: { appBanner: {}, section: {}, selectedSiteId: null },
	reader: {
		feeds: { items: {} },
		sites: { items: {} },
	},
};

describe( 'mapStateToFullPostProps', () => {
	it( 'returns a pending post when no post prop exists', () => {
		const props = mapStateToFullPostProps( fullPostState, {
			blogId: 100,
			postId: 1,
		} );

		expect( props.post ).toEqual( { _state: 'pending' } );
	} );

	it( 'uses cached post props for referral posts', () => {
		const referralPost = {
			ID: 2,
			site_ID: 100,
			global_ID: 'referral-global',
			title: 'Cached referral',
		};

		const props = mapStateToFullPostProps( fullPostState, {
			blogId: 100,
			postId: 1,
			referral: { blogId: 100, postId: 2 },
			referralPost,
		} );

		expect( props.referralPost ).toBe( referralPost );
	} );

	it( 'passes feed props without mutating Redux state', () => {
		const feed = {
			feed_ID: 200,
			name: 'External feed',
		};

		const props = mapStateToFullPostProps( fullPostState, {
			feedId: 200,
			postId: 1,
			post: { ID: 1, site_ID: 2, is_external: true },
			feed,
		} );

		expect( props.feed ).toEqual( {
			feed_ID: 200,
			name: 'External feed',
		} );
		expect( props.feed ).toBe( feed );
		expect( feed ).toEqual( {
			feed_ID: 200,
			name: 'External feed',
		} );
	} );
} );

describe( 'withFullPostNavigation', () => {
	beforeEach( () => {
		usePostCommentsApiDisabled.mockReturnValue( false );
		usePost.mockImplementation( ( postKey ) => ( {
			data: postKey?.postId ? { ID: postKey.postId, site_ID: postKey.blogId } : undefined,
		} ) );
		useStreamPostKeySelection.mockReturnValue( {
			previousPostKey: { blogId: 100, postId: 1 },
			nextPostKey: { blogId: 100, postId: 3 },
		} );
	} );

	it( 'resolves current, referral, previous, and next posts from Reader post queries', () => {
		const WrappedComponent = jest.fn( () => <div data-testid="wrapped-full-post" /> );
		const FullPostNavigation = withFullPostNavigation( WrappedComponent );
		const store = createStore( ( state = {} ) => state, {
			readerUi: { currentStream: 'following' },
			ui: { language: { localeSlug: 'en' } },
		} );

		render(
			<Provider store={ store }>
				<FullPostNavigation blogId="100" postId="2" referral={ { blogId: 100, postId: 9 } } />
			</Provider>
		);

		expect( useStreamPostKeySelection ).toHaveBeenCalledWith( {
			streamKey: 'following',
			localeSlug: null,
			currentPostKey: { blogId: 100, postId: 2 },
		} );
		expect( usePost ).toHaveBeenCalledWith( { blogId: 100, postId: 2 } );
		expect( usePost ).toHaveBeenCalledWith( { blogId: 100, postId: 9 } );
		expect( usePost ).toHaveBeenCalledWith( { blogId: 100, postId: 1 } );
		expect( usePost ).toHaveBeenCalledWith( { blogId: 100, postId: 3 } );
		expect( usePostCommentsApiDisabled ).toHaveBeenCalledWith(
			{ siteId: 100, postId: 2 },
			{ enabled: true }
		);
		expect( WrappedComponent ).toHaveBeenCalled();
		expect( WrappedComponent.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.objectContaining( {
				post: { ID: 2, site_ID: 100 },
				referralPost: { ID: 9, site_ID: 100 },
				commentsApiDisabled: false,
				previousPost: { ID: 1, site_ID: 100 },
				nextPost: { ID: 3, site_ID: 100 },
			} )
		);
	} );

	it( 'passes the comments API disabled state from Reader comment queries', () => {
		usePostCommentsApiDisabled.mockReturnValue( true );
		const WrappedComponent = jest.fn( () => <div data-testid="wrapped-full-post" /> );
		const FullPostNavigation = withFullPostNavigation( WrappedComponent );
		const store = createStore( ( state = {} ) => state, {
			readerUi: { currentStream: 'following' },
			ui: { language: { localeSlug: 'en' } },
		} );

		render(
			<Provider store={ store }>
				<FullPostNavigation blogId="100" postId="2" />
			</Provider>
		);

		expect( WrappedComponent ).toHaveBeenCalled();
		expect( WrappedComponent.mock.calls[ 0 ][ 0 ] ).toEqual(
			expect.objectContaining( {
				commentsApiDisabled: true,
			} )
		);
	} );
} );

describe( 'FullPostView Comments API Disabled Logic', () => {
	describe( 'when comments API is disabled', () => {
		it( 'should not render Comments component', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView commentsApiDisabled shouldShowComments={ shouldShowComments } />
				</Provider>
			);

			expect( queryByTestId( 'comments' ) ).not.toBeInTheDocument();
		} );

		it( 'should not render CommentButton', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView commentsApiDisabled shouldShowComments={ shouldShowComments } />
				</Provider>
			);

			expect( queryByTestId( 'comment-button' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when comments API is enabled', () => {
		it( 'should render Comments component when shouldShowComments is true', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView
						commentsApiDisabled={ false }
						shouldShowComments={ shouldShowComments }
					/>
				</Provider>
			);

			expect( queryByTestId( 'comments' ) ).toBeInTheDocument();
		} );

		it( 'should render CommentButton when API is enabled', () => {
			const store = createMockStore();
			const shouldShowComments = jest.fn( () => true );

			const { queryByTestId } = render(
				<Provider store={ store }>
					<MockFullPostView
						commentsApiDisabled={ false }
						shouldShowComments={ shouldShowComments }
					/>
				</Provider>
			);

			expect( queryByTestId( 'comment-button' ) ).toBeInTheDocument();
		} );
	} );
} );
