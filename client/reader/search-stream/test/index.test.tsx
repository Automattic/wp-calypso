/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SearchStream from '../index';

jest.mock( '@automattic/calypso-router', () => ( { replace: jest.fn() } ) );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/lib/with-dimensions', () => ( Component: React.ComponentType ) => Component );
jest.mock( '../suggestion-provider', () => ( Component: React.ComponentType ) => Component );
jest.mock( 'calypso/reader/discover/components/header-and-navigation', () => () => (
	<nav aria-label="Discover navigation" />
) );
jest.mock( '../recommended-blogs', () => ( {
	SearchRecommendedBlogs: () => <section aria-label="Blogs to follow" />,
} ) );
jest.mock( '../post-results', () => ( { query }: { query?: string } ) => (
	<section aria-label="Post results">{ query }</section>
) );

describe( 'SearchStream recommendations', () => {
	beforeEach( () => jest.spyOn( window, 'scrollTo' ).mockImplementation( () => {} ) );
	afterEach( () => jest.restoreAllMocks() );

	it( 'shows recommendations for an empty query and keeps results when a query is entered', () => {
		const { rerender } = renderWithProvider( <SearchStream query="" /> );
		expect( screen.getByRole( 'region', { name: 'Blogs to follow' } ) ).toBeVisible();
		expect( screen.getByRole( 'navigation', { name: 'Discover navigation' } ) ).toBeVisible();

		rerender( <SearchStream query="architecture" /> );
		expect( screen.queryByRole( 'region', { name: 'Blogs to follow' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'region', { name: 'Post results' } ) ).toHaveTextContent(
			'architecture'
		);
		expect( screen.getByRole( 'navigation', { name: 'Discover navigation' } ) ).toBeVisible();

		rerender( <SearchStream query="" /> );
		expect( screen.getByRole( 'region', { name: 'Blogs to follow' } ) ).toBeVisible();
	} );
} );
