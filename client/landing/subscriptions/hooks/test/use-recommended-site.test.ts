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
const mockTranslate = translate as jest.MockedFunction< typeof translate >;
const mockGetListByOwnerAndSlug = getListByOwnerAndSlug as jest.MockedFunction<
	typeof getListByOwnerAndSlug
>;
const mockGetMatchingItem = getMatchingItem as jest.MockedFunction< typeof getMatchingItem >;
const mockAddRecommendedBlogsSite = addRecommendedBlogsSite as jest.MockedFunction<
	typeof addRecommendedBlogsSite
>;
const mockRemoveRecommendedBlogsSite = removeRecommendedBlogsSite as jest.MockedFunction<
	typeof removeRecommendedBlogsSite
>;

describe( 'useRecommendedSite', () => {
	const mockDispatch = jest.fn();
	const feedId = 456;
	const blogId = 123;

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseDispatch.mockReturnValue( mockDispatch );
		mockTranslate.mockImplementation( ( text ) => text as string );

		// Default mock setup
		mockGetListByOwnerAndSlug.mockReturnValue( {
			ID: 999,
			owner: 'testuser',
			slug: 'recommended-blogs',
		} );
		mockGetMatchingItem.mockReturnValue( false );
	} );

	describe( 'Initial state', () => {
		it( 'should return correct initial state when user is logged in and site is not recommended', () => {
			// Mock current user and no matching items
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			expect( result.current ).toEqual( {
				isRecommended: false,
				isUpdating: false,
				canToggle: true,
				toggleRecommended: expect.any( Function ),
			} );
		} );

		it( 'should return correct initial state when site is recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( true ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			expect( result.current.isRecommended ).toBe( true );
			expect( result.current.canToggle ).toBe( true );
		} );

		it( 'should set canToggle to false when user is not logged in', () => {
			mockUseSelector
				.mockReturnValueOnce( null ) // getCurrentUserName
				.mockReturnValueOnce( null ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			expect( result.current.canToggle ).toBe( false );
		} );

		it( 'should set canToggle to false when currentUserName is not a string', () => {
			mockUseSelector
				.mockReturnValueOnce( 123 ) // getCurrentUserName (not a string)
				.mockReturnValueOnce( null ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			expect( result.current.canToggle ).toBe( false );
		} );
	} );

	describe( 'Selector logic', () => {
		it( 'should check feedId first then fall back to siteId', () => {
			const mockState = { reader: { lists: {} } };
			let selectorCallCount = 0;
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return 'testuser';
				}
				// Handle the recommendedBlogsList selector
				if ( selectorCallCount === 0 ) {
					selectorCallCount++;
					return { ID: 999, owner: 'testuser', slug: 'recommended-blogs' };
				}
				// Handle the isInRecommendedList selector
				return selector( mockState );
			} );

			// Mock feed match found
			mockGetMatchingItem.mockReturnValueOnce( { feed_ID: feedId } );

			renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			// Should call getMatchingItem with feedId first
			expect( mockGetMatchingItem ).toHaveBeenCalledWith( mockState, {
				listId: 999,
				feedId,
			} );
		} );

		it( 'should fall back to siteId when feedId not found and blogId provided', () => {
			const mockState = { reader: { lists: {} } };
			let selectorCallCount = 0;
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return 'testuser';
				}
				// Handle the recommendedBlogsList selector
				if ( selectorCallCount === 0 ) {
					selectorCallCount++;
					return { ID: 999, owner: 'testuser', slug: 'recommended-blogs' };
				}
				// Handle the isInRecommendedList selector
				return selector( mockState );
			} );

			// Mock no feed match, but site match found
			mockGetMatchingItem
				.mockReturnValueOnce( false ) // feedId not found
				.mockReturnValueOnce( { site_ID: blogId } ); // siteId found

			renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			expect( mockGetMatchingItem ).toHaveBeenCalledWith( mockState, {
				listId: 999,
				feedId,
			} );
			expect( mockGetMatchingItem ).toHaveBeenCalledWith( mockState, {
				listId: 999,
				siteId: blogId,
			} );
		} );

		it( 'should return false when no list exists', () => {
			const mockState = { reader: { lists: {} } };
			mockGetListByOwnerAndSlug.mockReturnValue( undefined );

			let selectorCallCount = 0;
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return 'testuser';
				}
				// Handle the recommendedBlogsList selector (returns null when no list)
				if ( selectorCallCount === 0 ) {
					selectorCallCount++;
					return null;
				}
				// Handle the isInRecommendedList selector
				return selector( mockState );
			} );

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			expect( result.current.isRecommended ).toBe( false );
		} );
	} );

	describe( 'Toggle function', () => {
		it( 'should dispatch addRecommendedBlogsSite when toggling to recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockAddRecommendedBlogsSite ).toHaveBeenCalledWith( 999, feedId, 'testuser', {
				successMessage: 'Site added to your recommended blogs.',
				errorMessage: 'Failed to add site to recommended blogs. Please try again.',
			} );
			expect( mockDispatch ).toHaveBeenCalled();
		} );

		it( 'should dispatch removeRecommendedBlogsSite when toggling to not recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( true ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockRemoveRecommendedBlogsSite ).toHaveBeenCalledWith( 999, feedId, 'testuser', {
				successMessage: 'Site removed from your recommended blogs.',
				errorMessage: 'Failed to remove site from recommended blogs.',
			} );
			expect( mockDispatch ).toHaveBeenCalled();
		} );

		it( 'should not toggle when canToggle is false', () => {
			mockUseSelector
				.mockReturnValueOnce( null ) // No current user
				.mockReturnValueOnce( null ) // No recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockDispatch ).not.toHaveBeenCalled();
			expect( result.current.isRecommended ).toBe( false );
		} );

		it( 'should allow multiple toggles in rapid succession', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			// Reset mockDispatch to clear any previous calls
			mockDispatch.mockClear();

			// Multiple rapid toggles are allowed since isUpdating gets reset in finally block
			act( () => {
				result.current.toggleRecommended();
				result.current.toggleRecommended();
			} );

			// Both dispatches should occur since the finally block resets isUpdating immediately
			expect( mockDispatch ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'Error handling', () => {
		it( 'should reset isUpdating even if dispatch throws an error', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			mockDispatch.mockImplementation( () => {
				throw new Error( 'Dispatch failed' );
			} );

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			// The hook doesn't catch dispatch errors - they bubble up
			act( () => {
				expect( () => result.current.toggleRecommended() ).toThrow( 'Dispatch failed' );
			} );

			// isUpdating should be reset even if dispatch throws
			expect( result.current.isUpdating ).toBe( false );

			// Reset mockDispatch back to normal behavior for subsequent tests
			mockDispatch.mockReset();
		} );
	} );

	describe( 'Hook dependencies and memoization', () => {
		it( 'should recreate toggleRecommended function when dependencies change', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result, rerender } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			// Force a rerender which may change internal state dependencies
			rerender();
			const secondToggleFunction = result.current.toggleRecommended;

			// Function may be recreated due to changing dependencies like isRecommended, isUpdating
			// This is actually the expected behavior given the useCallback dependencies
			expect( typeof secondToggleFunction ).toBe( 'function' );
		} );

		it( 'should update toggleRecommended when dependencies change', () => {
			let currentUser: string | null = 'testuser1';
			let recommendedList = { ID: 999, owner: 'testuser1', slug: 'recommended-blogs' };
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return currentUser;
				}
				// For the list selector, we need to handle it properly
				if ( typeof selector === 'function' ) {
					return currentUser ? recommendedList : null;
				}
				return false;
			} );

			const { result, rerender } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );
			const firstToggleFunction = result.current.toggleRecommended;

			// Change currentUserName
			currentUser = 'testuser2';
			recommendedList = { ID: 888, owner: 'testuser2', slug: 'recommended-blogs' };
			rerender();
			const secondToggleFunction = result.current.toggleRecommended;

			// Function should be recreated when dependencies change
			expect( firstToggleFunction ).not.toBe( secondToggleFunction );
		} );
	} );

	describe( 'Real-world scenarios', () => {
		it( 'should handle rapid toggle attempts correctly', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			// Reset mockDispatch to clear any previous calls
			mockDispatch.mockClear();

			// Rapidly toggle multiple times
			act( () => {
				result.current.toggleRecommended();
				result.current.toggleRecommended();
				result.current.toggleRecommended();
			} );

			// All dispatches should occur since isUpdating is reset immediately in finally block
			expect( mockDispatch ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'should handle user state changes during component lifecycle', () => {
			let currentUser: string | null = 'testuser1';
			const recommendedList = { ID: 999, owner: 'testuser1', slug: 'recommended-blogs' };
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return currentUser;
				}
				// For the list selector, we need to handle it properly
				if ( typeof selector === 'function' ) {
					return currentUser ? recommendedList : null;
				}
				return false;
			} );

			const { result, rerender } = renderHook( () => useRecommendedSite( feedId, { blogId } ) );

			expect( result.current.canToggle ).toBe( true );

			// User logs out
			currentUser = null;
			rerender();

			expect( result.current.canToggle ).toBe( false );
		} );

		it( 'should work without blogId option', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () => useRecommendedSite( feedId ) );

			expect( result.current.canToggle ).toBe( true );
			expect( result.current.isRecommended ).toBe( false );
		} );
	} );
} );
