/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import {
	addRecommendedBlogsFeed,
	removeRecommendedBlogsFeed,
	addRecommendedBlogsSite,
	removeRecommendedBlogsSite,
} from 'calypso/state/reader/lists/actions';
import { getListByOwnerAndSlug, getMatchingItem } from 'calypso/state/reader/lists/selectors';
import { useRecommendedContent } from '../use-recommended-content';

// Mock dependencies
jest.mock( 'react-redux' );
jest.mock( 'i18n-calypso' );
jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/state/reader/lists/actions', () => ( {
	addRecommendedBlogsFeed: jest.fn(),
	removeRecommendedBlogsFeed: jest.fn(),
	addRecommendedBlogsSite: jest.fn(),
	removeRecommendedBlogsSite: jest.fn(),
} ) );
jest.mock( 'calypso/state/reader/lists/selectors' );

const mockUseSelector = useSelector as jest.MockedFunction< typeof useSelector >;
const mockUseDispatch = useDispatch as jest.MockedFunction< typeof useDispatch >;
const mockTranslate = translate as jest.MockedFunction< typeof translate >;
const mockGetListByOwnerAndSlug = getListByOwnerAndSlug as jest.MockedFunction<
	typeof getListByOwnerAndSlug
>;
const mockGetMatchingItem = getMatchingItem as jest.MockedFunction< typeof getMatchingItem >;
const mockAddRecommendedBlogsFeed = addRecommendedBlogsFeed as jest.MockedFunction<
	typeof addRecommendedBlogsFeed
>;
const mockRemoveRecommendedBlogsFeed = removeRecommendedBlogsFeed as jest.MockedFunction<
	typeof removeRecommendedBlogsFeed
>;
const mockAddRecommendedBlogsSite = addRecommendedBlogsSite as jest.MockedFunction<
	typeof addRecommendedBlogsSite
>;
const mockRemoveRecommendedBlogsSite = removeRecommendedBlogsSite as jest.MockedFunction<
	typeof removeRecommendedBlogsSite
>;

describe( 'useRecommendedContent', () => {
	const mockDispatch = jest.fn();
	const feedId = 456;
	const siteId = 123;

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

	describe( 'Initial state for feeds', () => {
		it( 'should return correct initial state when user is logged in and feed is not recommended', () => {
			// Mock current user and no matching items
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
					fallbackSiteId: siteId,
				} )
			);

			expect( result.current ).toEqual( {
				isRecommended: false,
				isUpdating: false,
				canToggle: true,
				toggleRecommended: expect.any( Function ),
			} );
		} );

		it( 'should return correct initial state when feed is recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( true ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
				} )
			);

			expect( result.current.isRecommended ).toBe( true );
			expect( result.current.canToggle ).toBe( true );
		} );
	} );

	describe( 'Initial state for sites', () => {
		it( 'should return correct initial state when site is not recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'site',
					contentId: siteId,
				} )
			);

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

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'site',
					contentId: siteId,
				} )
			);

			expect( result.current.isRecommended ).toBe( true );
			expect( result.current.canToggle ).toBe( true );
		} );
	} );

	describe( 'Authentication state', () => {
		it( 'should set canToggle to false when user is not logged in', () => {
			mockUseSelector
				.mockReturnValueOnce( null ) // getCurrentUserName
				.mockReturnValueOnce( null ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
				} )
			);

			expect( result.current.canToggle ).toBe( false );
		} );

		it( 'should set canToggle to false when currentUserName is not a string', () => {
			mockUseSelector
				.mockReturnValueOnce( 123 ) // getCurrentUserName (not a string)
				.mockReturnValueOnce( null ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
				} )
			);

			expect( result.current.canToggle ).toBe( false );
		} );
	} );

	describe( 'Selector logic for feeds', () => {
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

			renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
					fallbackSiteId: siteId,
				} )
			);

			// Should call getMatchingItem with feedId first
			expect( mockGetMatchingItem ).toHaveBeenCalledWith( mockState, {
				listId: 999,
				feedId,
			} );
		} );

		it( 'should fall back to siteId when feedId not found and fallbackSiteId provided', () => {
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
				.mockReturnValueOnce( { site_ID: siteId } ); // siteId found

			renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
					fallbackSiteId: siteId,
				} )
			);

			expect( mockGetMatchingItem ).toHaveBeenCalledWith( mockState, {
				listId: 999,
				feedId,
			} );
			expect( mockGetMatchingItem ).toHaveBeenCalledWith( mockState, {
				listId: 999,
				siteId,
			} );
		} );
	} );

	describe( 'Selector logic for sites', () => {
		it( 'should check siteId for site content type', () => {
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

			// Mock site match found
			mockGetMatchingItem.mockReturnValueOnce( { site_ID: siteId } );

			renderHook( () =>
				useRecommendedContent( {
					contentType: 'site',
					contentId: siteId,
				} )
			);

			// Should call getMatchingItem with siteId
			expect( mockGetMatchingItem ).toHaveBeenCalledWith( mockState, {
				listId: 999,
				siteId,
			} );
		} );
	} );

	describe( 'Toggle function for feeds', () => {
		it( 'should dispatch addRecommendedBlogsFeed when toggling to recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
				} )
			);

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockAddRecommendedBlogsFeed ).toHaveBeenCalledWith( 999, feedId, 'testuser', {
				successMessage: 'Feed added to your recommended blogs.',
				errorMessage: 'Failed to add feed to recommended blogs. Please try again.',
			} );
			expect( mockDispatch ).toHaveBeenCalled();
		} );

		it( 'should dispatch removeRecommendedBlogsFeed when toggling to not recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( true ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
				} )
			);

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockRemoveRecommendedBlogsFeed ).toHaveBeenCalledWith( 999, feedId, 'testuser', {
				successMessage: 'Feed removed from your recommended blogs.',
				errorMessage: 'Failed to remove feed from recommended blogs.',
			} );
			expect( mockDispatch ).toHaveBeenCalled();
		} );
	} );

	describe( 'Toggle function constraints', () => {
		it( 'should not toggle when canToggle is false', () => {
			mockUseSelector
				.mockReturnValueOnce( null ) // No current user
				.mockReturnValueOnce( null ) // No recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
				} )
			);

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

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'feed',
					contentId: feedId,
				} )
			);

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

	describe( 'Toggle function for sites', () => {
		it( 'should dispatch addRecommendedBlogsSite when toggling to recommended', () => {
			mockUseSelector
				.mockReturnValueOnce( 'testuser' ) // getCurrentUserName
				.mockReturnValueOnce( { ID: 999, owner: 'testuser', slug: 'recommended-blogs' } ) // recommendedBlogsList
				.mockReturnValueOnce( false ); // isInRecommendedList

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'site',
					contentId: siteId,
				} )
			);

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockAddRecommendedBlogsSite ).toHaveBeenCalledWith( 999, siteId, 'testuser', {
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

			const { result } = renderHook( () =>
				useRecommendedContent( {
					contentType: 'site',
					contentId: siteId,
				} )
			);

			act( () => {
				result.current.toggleRecommended();
			} );

			expect( mockRemoveRecommendedBlogsSite ).toHaveBeenCalledWith( 999, siteId, 'testuser', {
				successMessage: 'Site removed from your recommended blogs.',
				errorMessage: 'Failed to remove site from recommended blogs.',
			} );
			expect( mockDispatch ).toHaveBeenCalled();
		} );
	} );
} );
