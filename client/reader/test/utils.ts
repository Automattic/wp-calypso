import page from '@automattic/calypso-router';
import { AppState } from 'calypso/types';
import { FRESHLY_PRESSED_TAB } from '../discover/helper';
import { DISCOVER_PREFIX } from '../discover/routes';
import {
	getSafeImageUrlForReader,
	showSelectedPost,
	getCurrentTabFromURL,
	getPostTitleFallback,
} from '../utils';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

describe( 'reader utils', () => {
	const dispatch = jest.fn();
	const getState = () =>
		( {
			reader: {
				posts: {
					items: {},
				},
			},
		} ) as AppState;

	beforeEach( () => {
		jest.resetAllMocks();
	} );

	describe( '#showSelectedPost', () => {
		test( 'does not do anything if postKey argument is missing', () => {
			showSelectedPost( {} )( dispatch, getState );
			expect( page ).not.toHaveBeenCalled();
		} );

		test( 'redirects if passed a post key', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 } } )( dispatch, getState );
			expect( page ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'redirects to a #comments URL if we passed comments argument', () => {
			showSelectedPost( { postKey: { feedId: 1, postId: 5 }, comments: true } )(
				dispatch,
				getState
			);
			expect( page as ( url: string ) => void ).toHaveBeenCalledWith(
				'/reader/feeds/1/posts/5#comments'
			); //
		} );
	} );

	describe( 'getSafeImageUrlForReader', () => {
		test( 'returns the url as is if it is from a trusted host', () => {
			const url = 'https://www.redditstatic.com/image.jpg';
			expect( getSafeImageUrlForReader( url ) ).toEqual( url );
		} );

		test( 'returns the Photon url if it is not from a trusted host', () => {
			const url = 'https://www.example.com/image.jpg';
			expect( getSafeImageUrlForReader( url ) ).not.toEqual( url );
		} );
	} );

	describe( 'getCurrentTabFromURL', () => {
		it( 'returns the current tab', () => {
			expect(
				getCurrentTabFromURL( '/discover/firstposts', DISCOVER_PREFIX, FRESHLY_PRESSED_TAB )
			).toEqual( 'firstposts' );
		} );

		it( 'ignores the locale', () => {
			expect(
				getCurrentTabFromURL( '/en/discover/firstposts', DISCOVER_PREFIX, FRESHLY_PRESSED_TAB )
			).toEqual( 'firstposts' );
		} );

		it( 'ignores the query params', () => {
			expect(
				getCurrentTabFromURL( '/discover/firstposts?foo=bar', DISCOVER_PREFIX, FRESHLY_PRESSED_TAB )
			).toEqual( 'firstposts' );
		} );

		it( 'returns the default tab when there is no tab', () => {
			expect( getCurrentTabFromURL( '/discover', DISCOVER_PREFIX, 'my-default-tab' ) ).toEqual(
				'my-default-tab'
			);
		} );
	} );

	describe( 'getPostTitleFallback', () => {
		it( 'returns the post title when it exists', () => {
			const post = { title: 'My Post Title', excerpt: 'Some excerpt', content: 'Some content' };
			expect( getPostTitleFallback( post ) ).toEqual( 'My Post Title' );
		} );

		it( 'returns truncated excerpt when title is empty', () => {
			const post = {
				title: '',
				excerpt:
					'This is a very long excerpt that should be truncated because it exceeds the maximum length allowed',
				content: 'Some content',
			};

			const result = getPostTitleFallback( post );
			expect( result.length ).toBeLessThanOrEqual( 60 );
		} );

		it( 'returns truncated content when title and excerpt are empty', () => {
			const post = {
				title: '',
				excerpt: '',
				content:
					'This is a very long content that should be truncated because it exceeds the maximum length allowed',
			};
			const result = getPostTitleFallback( post );
			expect( result.length ).toBeLessThanOrEqual( 60 );
		} );

		it( 'strips HTML tags from excerpt', () => {
			const post = {
				title: '',
				excerpt: '<p>This is <strong>formatted</strong> text</p>',
				content: '',
			};
			expect( getPostTitleFallback( post ) ).toEqual( 'This is formatted text' );
		} );

		it( 'strips HTML tags from content', () => {
			const post = {
				title: '',
				excerpt: '',
				content: '<div><img src="photo.jpg" /><p>Content after image</p></div>',
			};
			expect( getPostTitleFallback( post ) ).toEqual( 'Content after image' );
		} );

		it( 'returns fallback value when title, excerpt, and content are empty', () => {
			const post = { title: '', excerpt: '', content: '' };
			expect( getPostTitleFallback( post, 'Untitled Post' ) ).toEqual( 'Untitled Post' );
		} );
	} );
} );
