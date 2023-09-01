/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import {
	useMarkAsNewsletterCategoryMutation,
	useNewsletterCategoriesQuery,
	useUnmarkAsNewsletterCategoryMutation,
} from 'calypso/data/newsletter-categories';
import useNewsletterCategoriesSettings, {
	convertToNewsletterCategory,
} from '../use-newsletter-categories-settings';

jest.mock( 'react-redux' );
jest.mock( 'i18n-calypso' );
jest.mock( 'calypso/data/newsletter-categories' );

const mockSiteId = 123;

const mockCategory1 = {
	ID: 1,
	description: 'Description 1',
	feed_url: 'feed_url',
	name: 'Category 1',
	parent: 0,
	post_count: 0,
	slug: 'category-1',
};

const mockCategory2 = {
	ID: 2,
	description: 'Description 2',
	feed_url: 'feed_url',
	name: 'Category 2',
	parent: 0,
	post_count: 0,
	slug: 'category-2',
};

const mockNewsletterCategory1 = convertToNewsletterCategory( mockCategory1 );

describe( 'useNewsletterCategoriesSettings', () => {
	beforeEach( () => {
		( useDispatch as jest.Mock ).mockReturnValue( jest.fn() );
		( useTranslate as jest.Mock ).mockReturnValue( ( text: string ) => text );
		( useNewsletterCategoriesQuery as jest.Mock ).mockReturnValue( {
			data: { newsletterCategories: [] },
			isLoading: true,
		} );
		( useMarkAsNewsletterCategoryMutation as jest.Mock ).mockReturnValue( {
			mutateAsync: jest.fn().mockResolvedValue( null ),
			isLoading: false,
		} );
		( useUnmarkAsNewsletterCategoryMutation as jest.Mock ).mockReturnValue( {
			mutateAsync: jest.fn().mockResolvedValue( null ),
			isLoading: false,
		} );
	} );

	it( 'returns isLoading correctly', () => {
		const { result } = renderHook( () => useNewsletterCategoriesSettings( mockSiteId ) );

		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'handles category toggle correctly', () => {
		const { result } = renderHook( () => useNewsletterCategoriesSettings( mockSiteId ) );

		act( () => {
			result.current.handleCategoryToggle( mockCategory1 );
		} );

		expect( result.current.newsletterCategories ).toEqual( [
			expect.objectContaining( { id: mockCategory1.ID } ),
		] );
	} );

	it( 'handles save correctly for marking and unmarking categories', async () => {
		( useNewsletterCategoriesQuery as jest.Mock ).mockReturnValue( {
			data: { newsletterCategories: [ mockNewsletterCategory1 ] },
			isLoading: false,
		} );

		const { result } = renderHook( () => useNewsletterCategoriesSettings( mockSiteId ) );

		// Toggle off category 1.
		act( () => {
			result.current.handleCategoryToggle( mockCategory1 );
		} );

		// Toggle on category 2.
		act( () => {
			result.current.handleCategoryToggle( mockCategory2 );
		} );

		await act( async () => {
			result.current.handleSave();
		} );

		const markMutation = useMarkAsNewsletterCategoryMutation( mockSiteId );
		const unmarkMutation = useUnmarkAsNewsletterCategoryMutation( mockSiteId );

		expect( unmarkMutation.mutateAsync ).toHaveBeenCalledWith( 1 );
		expect( markMutation.mutateAsync ).toHaveBeenCalledWith( 2 );
	} );
} );
