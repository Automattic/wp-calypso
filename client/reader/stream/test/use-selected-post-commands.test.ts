/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { usePostLikes } from 'calypso/components/data/post-likes';
import { useCachedPost } from 'calypso/reader/data/post/cache';
import { usePostLikeActions } from 'calypso/reader/data/post/likes';
import { isLikeable } from 'calypso/reader/post/capabilities';
import { showSelectedPost } from 'calypso/reader/utils';
import { getXPostMetadata } from 'calypso/reader/xpost-helper';
import { useSelectedPostCommands } from '../use-selected-post-commands';
import type { StreamItem } from 'calypso/reader/data/stream/types';

jest.mock( 'calypso/reader/data/post/cache', () => ( { useCachedPost: jest.fn() } ) );
jest.mock( 'calypso/components/data/post-likes', () => ( {
	usePostLikes: jest.fn(),
} ) );
jest.mock( 'calypso/reader/data/post/likes', () => ( { usePostLikeActions: jest.fn() } ) );
jest.mock( 'calypso/reader/post/capabilities', () => ( { isLikeable: jest.fn() } ) );
jest.mock( 'calypso/reader/utils', () => ( { showSelectedPost: jest.fn() } ) );
jest.mock( 'calypso/reader/xpost-helper', () => ( { getXPostMetadata: jest.fn() } ) );

const mockUseCachedPost = useCachedPost as jest.Mock;
const mockUsePostLikeActions = usePostLikeActions as jest.Mock;
const mockUsePostLikes = usePostLikes as jest.Mock;
const mockIsLikeable = isLikeable as jest.Mock;
const mockShowSelectedPost = showSelectedPost as jest.Mock;
const mockGetXPostMetadata = getXPostMetadata as jest.Mock;

const LIKEABLE_POST = { site_ID: 5, ID: 9, URL: 'https://example.com/hello', i_like: false };

function setup( {
	post = LIKEABLE_POST as unknown,
	postLikes = null,
	likeActions = {},
	selectedPostKey = null,
}: {
	post?: unknown;
	postLikes?: unknown;
	likeActions?: Record< string, unknown >;
	selectedPostKey?: StreamItem | null;
} = {} ) {
	const actions = {
		like: jest.fn(),
		unlike: jest.fn(),
		isLikePending: false,
		isUnlikePending: false,
		...likeActions,
	};
	mockUseCachedPost.mockReturnValue( post );
	mockUsePostLikeActions.mockReturnValue( actions );
	mockUsePostLikes.mockReturnValue( { postLikes } );
	const { result } = renderHook( () => useSelectedPostCommands( selectedPostKey ) );
	return { result, actions };
}

beforeEach( () => {
	jest.clearAllMocks();
	mockIsLikeable.mockReturnValue( true );
	mockGetXPostMetadata.mockReturnValue( null );
	mockShowSelectedPost.mockReturnValue( jest.fn() );
} );

describe( 'useSelectedPostCommands', () => {
	describe( 'openSelected', () => {
		it( 'navigates to the selected post via showSelectedPost', () => {
			const navigate = jest.fn();
			mockShowSelectedPost.mockReturnValue( navigate );
			const { result } = setup( {
				selectedPostKey: { blogId: 5, postId: 9 } as unknown as StreamItem,
			} );

			result.current.openSelected();

			expect( mockShowSelectedPost ).toHaveBeenCalledWith( {
				postKey: { blogId: 5, feedId: undefined, postId: 9 },
			} );
			expect( navigate ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does nothing without a selection', () => {
			const { result } = setup( { selectedPostKey: null } );

			result.current.openSelected();

			expect( mockShowSelectedPost ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'openSelectedInNewTab', () => {
		it( 'opens the post URL in a new tab', () => {
			const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
			const { result } = setup();

			result.current.openSelectedInNewTab();

			expect( open ).toHaveBeenCalledWith(
				'https://example.com/hello',
				'_blank',
				'noreferrer,noopener'
			);
			open.mockRestore();
		} );

		it( 'does nothing without a cached post or URL', () => {
			const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
			const { result } = setup( { post: null } );

			result.current.openSelectedInNewTab();

			expect( open ).not.toHaveBeenCalled();
			open.mockRestore();
		} );
	} );

	describe( 'toggleSelectedLike', () => {
		it( 'likes an unliked post', () => {
			const { result, actions } = setup( { post: { ...LIKEABLE_POST, i_like: false } } );

			result.current.toggleSelectedLike();

			expect( actions.like ).toHaveBeenCalledWith( 5, 9, { source: 'reader' } );
			expect( actions.unlike ).not.toHaveBeenCalled();
		} );

		it( 'unlikes a liked post', () => {
			const { result, actions } = setup( { post: { ...LIKEABLE_POST, i_like: true } } );

			result.current.toggleSelectedLike();

			expect( actions.unlike ).toHaveBeenCalledWith( 5, 9, { source: 'reader' } );
			expect( actions.like ).not.toHaveBeenCalled();
		} );

		it( 'normalizes numeric liked state before toggling', () => {
			const { result, actions } = setup( { post: { ...LIKEABLE_POST, i_like: 1 } } );

			result.current.toggleSelectedLike();

			expect( actions.unlike ).toHaveBeenCalledWith( 5, 9, { source: 'reader' } );
			expect( actions.like ).not.toHaveBeenCalled();
		} );

		it( 'normalizes string unliked state before toggling', () => {
			const { result, actions } = setup( { post: { ...LIKEABLE_POST, i_like: '0' } } );

			result.current.toggleSelectedLike();

			expect( actions.like ).toHaveBeenCalledWith( 5, 9, { source: 'reader' } );
			expect( actions.unlike ).not.toHaveBeenCalled();
		} );

		it( 'uses the post likes query state when it is available', () => {
			const { result, actions } = setup( {
				post: { ...LIKEABLE_POST, i_like: false },
				postLikes: { iLike: true },
			} );

			result.current.toggleSelectedLike();

			expect( actions.unlike ).toHaveBeenCalledWith( 5, 9, { source: 'reader' } );
			expect( actions.like ).not.toHaveBeenCalled();
		} );

		it( 'allows the opposite toggle while the previous mutation is pending', () => {
			const { result, actions } = setup( {
				post: { ...LIKEABLE_POST, i_like: false },
				postLikes: { iLike: true },
				likeActions: { isLikePending: true },
			} );

			result.current.toggleSelectedLike();

			expect( actions.unlike ).toHaveBeenCalledWith( 5, 9, { source: 'reader' } );
			expect( actions.like ).not.toHaveBeenCalled();
		} );

		it( 'skips x-posts', () => {
			mockGetXPostMetadata.mockReturnValue( { postURL: 'https://example.com/original' } );
			const { result, actions } = setup();

			result.current.toggleSelectedLike();

			expect( actions.like ).not.toHaveBeenCalled();
			expect( actions.unlike ).not.toHaveBeenCalled();
		} );

		it( 'skips non-likeable posts', () => {
			mockIsLikeable.mockReturnValue( false );
			const { result, actions } = setup();

			result.current.toggleSelectedLike();

			expect( actions.like ).not.toHaveBeenCalled();
		} );

		it( 'bails while a like mutation is pending', () => {
			const { result, actions } = setup( { likeActions: { isLikePending: true } } );

			result.current.toggleSelectedLike();

			expect( actions.like ).not.toHaveBeenCalled();
		} );

		it( 'does nothing without a cached post', () => {
			const { result, actions } = setup( { post: null } );

			result.current.toggleSelectedLike();

			expect( actions.like ).not.toHaveBeenCalled();
			expect( actions.unlike ).not.toHaveBeenCalled();
		} );
	} );
} );
