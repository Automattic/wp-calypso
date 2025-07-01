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
import { useRecommendedSite } from '../use-recommended-site';

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

describe( 'useRecommendedSite', () => {
	const mockDispatch = jest.fn();
	const mockFeedId = 123;
	const mockCurrentUser = 'testuser';
	const mockList = { ID: 456, owner: 'testuser', slug: 'recommended-blogs' };

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseDispatch.mockReturnValue( mockDispatch );
		mockTranslate.mockImplementation( ( text ) => text );

		// Default mocks
		mockUseSelector.mockImplementation( ( selector ) => {
			if ( selector === getCurrentUserName ) {
				return mockCurrentUser;
			}
			// Mock for recommendedBlogsList selector
			if ( selector.toString().includes( 'getListByOwnerAndSlug' ) ) {
				return mockList;
			}
			// Mock for isInRecommendedList selector
			return false;
		} );

		mockGetCurrentUserName.mockReturnValue( mockCurrentUser );
		mockGetListByOwnerAndSlug.mockReturnValue( mockList );
		mockGetMatchingItem.mockReturnValue( false );
	} );

	describe( 'Basic functionality', () => {
		it( 'should return correct initial state', () => {
			const { result } = renderHook( () => useRecommendedSite( mockFeedId ) );

			expect( result.current ).toEqual( {
				isRecommended: false,
				isUpdating: false,
				canToggle: true,
				toggleRecommended: expect.any( Function ),
			} );
		} );

		it( 'should return true for isRecommended when feed is in list', () => {
			mockGetMatchingItem.mockReturnValue( { feed_ID: mockFeedId } );
			// Update the selector mock to return true for isInRecommendedList
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return mockCurrentUser;
				}
				if ( selector.toString().includes( 'getListByOwnerAndSlug' ) ) {
					return mockList;
				}
				return true; // isInRecommendedList returns true
			} );

			const { result } = renderHook( () => useRecommendedSite( mockFeedId ) );

			expect( result.current.isRecommended ).toBe( true );
		} );

		it( 'should return false for canToggle when no user or list', () => {
			mockGetCurrentUserName.mockReturnValue( null );
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return null;
				}
				return null;
			} );

			const { result } = renderHook( () => useRecommendedSite( mockFeedId ) );

			expect( result.current.canToggle ).toBe( false );
		} );
	} );

	describe( 'Toggle functionality', () => {
		it( 'should dispatch addRecommendedBlogsSite when toggling on', () => {
			const { result } = renderHook( () => useRecommendedSite( mockFeedId ) );

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
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return mockCurrentUser;
				}
				if ( selector.toString().includes( 'getListByOwnerAndSlug' ) ) {
					return mockList;
				}
				return true; // isInRecommendedList returns true
			} );

			const { result } = renderHook( () => useRecommendedSite( mockFeedId ) );

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
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return null;
				}
				return null;
			} );

			const { result } = renderHook( () => useRecommendedSite( mockFeedId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockDispatch ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Redux integration', () => {
		it( 'should show recommended state from Redux selector', () => {
			// Mock that the site is already recommended in Redux
			mockGetMatchingItem.mockReturnValue( { feed_ID: mockFeedId } );
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return mockCurrentUser;
				}
				if ( selector.toString().includes( 'getListByOwnerAndSlug' ) ) {
					return mockList;
				}
				return true; // isInRecommendedList returns true
			} );

			const { result } = renderHook( () => useRecommendedSite( mockFeedId ) );

			expect( result.current.isRecommended ).toBe( true );
		} );

		it( 'should react to Redux state changes', () => {
			let isRecommendedState = false;

			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return mockCurrentUser;
				}
				if ( selector.toString().includes( 'getListByOwnerAndSlug' ) ) {
					return mockList;
				}
				return isRecommendedState; // Return current state
			} );

			const { result, rerender } = renderHook( () => useRecommendedSite( mockFeedId ) );

			expect( result.current.isRecommended ).toBe( false );

			// Simulate Redux state change
			isRecommendedState = true;
			rerender();

			expect( result.current.isRecommended ).toBe( true );
		} );
	} );
} );
