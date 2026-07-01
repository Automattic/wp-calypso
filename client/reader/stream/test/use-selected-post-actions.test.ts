/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useCachedPost } from 'calypso/reader/data/post/cache';
import { usePostLikeActions } from 'calypso/reader/data/post/likes';
import { isLikeable } from 'calypso/reader/post/capabilities';
import { getXPostMetadata } from 'calypso/reader/xpost-helper';
import { useSelectedPostActions } from '../use-selected-post-actions';

jest.mock( 'calypso/reader/data/post/cache', () => ( { useCachedPost: jest.fn() } ) );
jest.mock( 'calypso/reader/data/post/likes', () => ( { usePostLikeActions: jest.fn() } ) );
jest.mock( 'calypso/reader/post/capabilities', () => ( { isLikeable: jest.fn() } ) );
jest.mock( 'calypso/reader/xpost-helper', () => ( { getXPostMetadata: jest.fn() } ) );

const mockUseCachedPost = useCachedPost as jest.Mock;
const mockUsePostLikeActions = usePostLikeActions as jest.Mock;
const mockIsLikeable = isLikeable as jest.Mock;
const mockGetXPostMetadata = getXPostMetadata as jest.Mock;

const LIKEABLE_POST = { site_ID: 5, ID: 9, URL: 'https://example.com/hello', i_like: false };

function setup( {
	post = LIKEABLE_POST as unknown,
	likeActions = {},
}: { post?: unknown; likeActions?: Record< string, unknown > } = {} ) {
	const actions = {
		like: jest.fn(),
		unlike: jest.fn(),
		isLikePending: false,
		isUnlikePending: false,
		...likeActions,
	};
	mockUseCachedPost.mockReturnValue( post );
	mockUsePostLikeActions.mockReturnValue( actions );
	const { result } = renderHook( () => useSelectedPostActions( null ) );
	return { result, actions };
}

beforeEach( () => {
	jest.clearAllMocks();
	mockIsLikeable.mockReturnValue( true );
	mockGetXPostMetadata.mockReturnValue( null );
} );

describe( 'useSelectedPostActions', () => {
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
