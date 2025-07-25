/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
import { getListByOwnerAndSlug, getMatchingItem } from 'calypso/state/reader/lists/selectors';
import { useFeedRecommendationsMutation } from '..';
import type { AppState } from 'calypso/types';

// Mock dependencies
jest.mock( 'react-redux' );
jest.mock( 'i18n-calypso' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/state/reader/lists/actions' );
jest.mock( 'calypso/state/reader/lists/selectors' );

const mockUseSelector = useSelector as jest.MockedFunction< typeof useSelector >;
const mockUseDispatch = useDispatch as jest.MockedFunction< typeof useDispatch >;
const mockGetCurrentUserName = getCurrentUserName as jest.MockedFunction<
	typeof getCurrentUserName
>;
const mockGetListByOwnerAndSlug = getListByOwnerAndSlug as jest.MockedFunction<
	typeof getListByOwnerAndSlug
>;
const mockGetMatchingItem = getMatchingItem as jest.MockedFunction< typeof getMatchingItem >;
const mockTranslate = translate as jest.MockedFunction< typeof translate >;

describe( 'useFeedRecommendationsMutation', () => {
	const mockDispatch = jest.fn();
	const mockFeedId = 123;
	const mockCurrentUser = 'testuser';
	const mockList = { ID: 456, owner: 'testuser', slug: 'recommended-blogs' };

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseDispatch.mockReturnValue( mockDispatch );
		mockTranslate.mockImplementation( ( text ) => text );

		// Mock selector functions directly
		mockGetCurrentUserName.mockReturnValue( mockCurrentUser );
		mockGetListByOwnerAndSlug.mockReturnValue( mockList );
		mockGetMatchingItem.mockReturnValue( false ); // Default: not recommended

		// Mock useSelector to call the actual selector functions
		mockUseSelector.mockImplementation( ( selector ) => {
			// Call the selector with a mock state - the selector will use our mocked functions
			return selector( {} as AppState );
		} );
	} );

	describe( 'Basic functionality', () => {
		it( 'should return correct initial state', () => {
			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			expect( result.current ).toEqual( {
				isRecommended: false,
				isUpdating: false,
				canToggle: true,
				toggleRecommended: expect.any( Function ),
			} );
		} );

		it( 'should return true for isRecommended when feed is in list', () => {
			// Mock that the feed is found in the list
			mockGetMatchingItem.mockReturnValue( { feed_ID: mockFeedId } );

			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			expect( result.current.isRecommended ).toBe( true );
		} );

		it( 'should return false for canToggle when no user', () => {
			mockGetCurrentUserName.mockReturnValue( null );

			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			expect( result.current.canToggle ).toBe( false );
		} );

		it( 'should return false for canToggle when no list', () => {
			mockGetListByOwnerAndSlug.mockReturnValue( undefined );

			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			expect( result.current.canToggle ).toBe( false );
		} );
	} );

	describe( 'Toggle functionality', () => {
		it( 'should dispatch addRecommendedBlogsSite when toggling on', () => {
			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockDispatch ).toHaveBeenCalledWith(
				addRecommendedBlogsSite( mockList.ID, mockFeedId, mockCurrentUser, {
					successMessage: 'Site added to your recommended blogs.',
					errorMessage: 'Failed to add site to recommended blogs. Please try again.',
				} )
			);
		} );

		it( 'should dispatch removeRecommendedBlogsSite when toggling off', () => {
			// Mock that the site is already recommended
			mockGetMatchingItem.mockReturnValue( { feed_ID: mockFeedId } );

			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockDispatch ).toHaveBeenCalledWith(
				removeRecommendedBlogsSite( mockList.ID, mockFeedId, mockCurrentUser, {
					successMessage: 'Site removed from your recommended blogs.',
					errorMessage: 'Failed to remove site from recommended blogs.',
				} )
			);
		} );

		it( 'should not dispatch when canToggle is false', () => {
			mockGetCurrentUserName.mockReturnValue( null );

			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockDispatch ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Redux integration', () => {
		it( 'should react to selector function changes', () => {
			const { result, rerender } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			expect( result.current.isRecommended ).toBe( false );

			// Change the mock return value to simulate Redux state change
			mockGetMatchingItem.mockReturnValue( { feed_ID: mockFeedId } );

			rerender();

			expect( result.current.isRecommended ).toBe( true );
		} );

		it( 'should handle missing user gracefully', () => {
			mockGetCurrentUserName.mockReturnValue( null );

			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			expect( result.current.isRecommended ).toBe( false );
			expect( result.current.canToggle ).toBe( false );
		} );

		it( 'should handle missing list gracefully', () => {
			mockGetListByOwnerAndSlug.mockReturnValue( undefined );

			const { result } = renderHook( () => useFeedRecommendationsMutation( mockFeedId ) );

			expect( result.current.isRecommended ).toBe( false );
			expect( result.current.canToggle ).toBe( false );
		} );
	} );
} );
