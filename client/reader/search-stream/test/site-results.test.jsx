/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import SiteResults from '../site-results';

jest.mock( 'calypso/lib/with-dimensions', () => ( Component ) => Component );
jest.mock( 'calypso/reader/components/reader-infinite-stream', () => ( props ) => (
	<div data-testid="infinite-stream" data-item-count={ props.items.length } />
) );

const NO_SITES = 'No sites found.';

const renderSiteResults = ( props = {} ) =>
	render(
		<SiteResults
			query="cats"
			searchResults={ undefined }
			fetchNextPage={ jest.fn() }
			{ ...props }
		/>
	);

describe( 'SiteResults', () => {
	it( 'shows loading placeholders (not the empty state) while the first page loads', () => {
		renderSiteResults( { isLoading: true, hasNextPage: false, searchResults: undefined } );

		expect( screen.queryByText( NO_SITES ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'infinite-stream' ) ).toHaveAttribute( 'data-item-count', '5' );
	} );

	it( 'keeps showing placeholders while more pages are still pending', () => {
		renderSiteResults( { isLoading: false, hasNextPage: true, searchResults: undefined } );

		expect( screen.queryByText( NO_SITES ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'infinite-stream' ) ).toHaveAttribute( 'data-item-count', '5' );
	} );

	it( 'shows "No sites found." once the query settles with no results (undefined)', () => {
		renderSiteResults( { isLoading: false, hasNextPage: false, searchResults: undefined } );

		expect( screen.getByText( NO_SITES ) ).toBeVisible();
		expect( screen.queryByTestId( 'infinite-stream' ) ).not.toBeInTheDocument();
	} );

	it( 'shows "No sites found." once the query settles with an empty array', () => {
		renderSiteResults( { isLoading: false, hasNextPage: false, searchResults: [] } );

		expect( screen.getByText( NO_SITES ) ).toBeVisible();
		expect( screen.queryByTestId( 'infinite-stream' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the results stream (not the empty state) when there are results', () => {
		renderSiteResults( {
			isLoading: false,
			hasNextPage: false,
			searchResults: [ { feed_ID: 1 }, { feed_ID: 2 } ],
		} );

		expect( screen.queryByText( NO_SITES ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'infinite-stream' ) ).toHaveAttribute( 'data-item-count', '2' );
	} );

	it( 'does not show the empty state before a query is entered', () => {
		renderSiteResults( {
			query: '',
			isLoading: false,
			hasNextPage: false,
			searchResults: undefined,
		} );

		expect( screen.queryByText( NO_SITES ) ).not.toBeInTheDocument();
	} );
} );
