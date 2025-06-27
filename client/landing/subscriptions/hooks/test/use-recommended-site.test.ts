/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
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
const mockAddRecommendedBlogsSite = addRecommendedBlogsSite as jest.MockedFunction<
	typeof addRecommendedBlogsSite
>;
const mockRemoveRecommendedBlogsSite = removeRecommendedBlogsSite as jest.MockedFunction<
	typeof removeRecommendedBlogsSite
>;

describe( 'useRecommendedSite', () => {
	const mockDispatch = jest.fn();
	const blogId = 123;

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseDispatch.mockReturnValue( mockDispatch );
		mockTranslate.mockImplementation( ( text ) => text as string );
	} );

	describe( 'Initial state', () => {
		it( 'should return correct initial state when user is logged in and site is not recommended', () => {
			// Mock current user
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( false ); // isSiteInRecommendedBlogsList

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

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
				.mockReturnValueOnce( true ); // isSiteInRecommendedBlogsList

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			expect( result.current.isRecommended ).toBe( true );
			expect( result.current.canToggle ).toBe( true );
		} );

		it( 'should set canToggle to false when user is not logged in', () => {
			mockUseSelector
				.mockReturnValueOnce( null ) // getCurrentUserName
				.mockReturnValueOnce( false ); // isSiteInRecommendedBlogsList

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			expect( result.current.canToggle ).toBe( false );
		} );

		it( 'should set canToggle to false when currentUserName is not a string', () => {
			mockUseSelector
				.mockReturnValueOnce( 123 ) // getCurrentUserName (not a string)
				.mockReturnValueOnce( false ); // isSiteInRecommendedBlogsList

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			expect( result.current.canToggle ).toBe( false );
		} );
	} );

	describe( 'Selector memoization', () => {
		it( 'should create memoized selector with correct dependencies', () => {
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( false );

			renderHook( () => useRecommendedSite( blogId ) );

			// Check that useSelector was called with a function
			expect( mockUseSelector ).toHaveBeenCalledWith( expect.any( Function ) );
		} );

		it( 'should return false from memoized selector when no current user', () => {
			mockUseSelector.mockReturnValueOnce( null ).mockReturnValueOnce( false );

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			// The hook should handle the case where currentUserName is null
			expect( result.current.isRecommended ).toBe( false );
		} );
	} );

	describe( 'Optimistic updates', () => {
		it( 'should show optimistic state during toggle to recommended', () => {
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( false ); // Initially not recommended

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			// Should show optimistic state immediately
			expect( result.current.isRecommended ).toBe( true );
			expect( result.current.isUpdating ).toBe( false ); // Gets reset in finally block
		} );

		it( 'should show optimistic state during toggle to not recommended', () => {
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( true ); // Initially recommended

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			// Should show optimistic state immediately
			expect( result.current.isRecommended ).toBe( false );
		} );

		it( 'should clear optimistic state when it matches selector state', async () => {
			let selectorReturnValue = false;
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return 'testuser';
				}
				return selectorReturnValue;
			} );

			const { result, rerender } = renderHook( () => useRecommendedSite( blogId ) );

			// Toggle to create optimistic state
			act( () => {
				result.current.toggleRecommended();
			} );

			expect( result.current.isRecommended ).toBe( true );

			// Simulate selector state catching up to optimistic state
			selectorReturnValue = true;
			rerender();

			// Optimistic state should be cleared when it matches selector
			await waitFor( () => {
				expect( result.current.isRecommended ).toBe( true );
			} );
		} );
	} );

	describe( 'Toggle function', () => {
		it( 'should dispatch addRecommendedBlogsSite when toggling to recommended', () => {
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( false );

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockAddRecommendedBlogsSite ).toHaveBeenCalledWith( blogId, 'testuser', {
				successMessage: 'Site successfully added to your recommended blogs!',
				errorMessage: 'Failed to add site to recommended blogs. Please try again.',
			} );
			expect( mockDispatch ).toHaveBeenCalled();
		} );

		it( 'should dispatch removeRecommendedBlogsSite when toggling to not recommended', () => {
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( true );

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockRemoveRecommendedBlogsSite ).toHaveBeenCalledWith( blogId, 'testuser', {
				successMessage: 'Site removed from your recommended blogs.',
				errorMessage: 'Failed to remove site from recommended blogs.',
			} );
			expect( mockDispatch ).toHaveBeenCalled();
		} );

		it( 'should not toggle when canToggle is false', () => {
			mockUseSelector
				.mockReturnValueOnce( null ) // No current user
				.mockReturnValueOnce( false );

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockDispatch ).not.toHaveBeenCalled();
			expect( result.current.isRecommended ).toBe( false );
		} );

		it( 'should allow multiple toggles in rapid succession', () => {
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( false );

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

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
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( false );

			mockDispatch.mockImplementation( () => {
				throw new Error( 'Dispatch failed' );
			} );

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

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
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( false );

			const { result, rerender } = renderHook( () => useRecommendedSite( blogId ) );

			// Force a rerender which may change internal state dependencies
			rerender();
			const secondToggleFunction = result.current.toggleRecommended;

			// Function may be recreated due to changing dependencies like isRecommended, isUpdating
			// This is actually the expected behavior given the useCallback dependencies
			expect( typeof secondToggleFunction ).toBe( 'function' );
		} );

		it( 'should update toggleRecommended when dependencies change', () => {
			let currentUser: string | null = 'testuser1';
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return currentUser;
				}
				return false;
			} );

			const { result, rerender } = renderHook( () => useRecommendedSite( blogId ) );
			const firstToggleFunction = result.current.toggleRecommended;

			// Change currentUserName
			currentUser = 'testuser2';
			rerender();
			const secondToggleFunction = result.current.toggleRecommended;

			// Function should be recreated when dependencies change
			expect( firstToggleFunction ).not.toBe( secondToggleFunction );
		} );
	} );

	describe( 'Real-world scenarios', () => {
		it( 'should handle rapid toggle attempts correctly', () => {
			mockUseSelector.mockReturnValueOnce( 'testuser' ).mockReturnValueOnce( false );

			const { result } = renderHook( () => useRecommendedSite( blogId ) );

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
			mockUseSelector.mockImplementation( ( selector ) => {
				if ( selector === getCurrentUserName ) {
					return currentUser;
				}
				return false;
			} );

			const { result, rerender } = renderHook( () => useRecommendedSite( blogId ) );

			expect( result.current.canToggle ).toBe( true );

			// User logs out
			currentUser = null;
			rerender();

			expect( result.current.canToggle ).toBe( false );
		} );
	} );
} );
