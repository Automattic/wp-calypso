/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ListSitesDirectory } from '../list-sites-directory';
import type { PublicListItem } from '../use-public-list-query';

// Mock ReaderSitesList to avoid deep dependency chain
jest.mock( 'calypso/reader/sites-list', () => ( {
	ReaderSitesList: ( { sites }: { sites: Array< { name: string } > } ) => (
		<ul data-testid="mock-sites-list">
			{ sites.map( ( site ) => (
				<li key={ site.name }>{ site.name }</li>
			) ) }
		</ul>
	),
} ) );

const mockItems: PublicListItem[] = [
	{
		blog_id: 456,
		feed_id: 1234,
		site_name: 'Smitten Kitchen',
		site_url: 'https://smittenkitchen.com',
		fediverse_handle: '@smittenkitchen@smittenkitchen.com',
		fediverse_handle_url: 'https://smittenkitchen.com/@smittenkitchen',
	},
	{
		blog_id: 789,
		feed_id: 5678,
		site_name: 'Another Blog',
		site_url: 'https://anotherblog.com',
		fediverse_handle: null,
		fediverse_handle_url: null,
	},
];

describe( 'ListSitesDirectory', () => {
	test( 'renders site items for each list item', () => {
		renderWithProvider( <ListSitesDirectory items={ mockItems } followSource="reader-list" /> );

		expect( screen.getByText( 'Smitten Kitchen' ) ).toBeVisible();
		expect( screen.getByText( 'Another Blog' ) ).toBeVisible();
	} );

	test( 'shows fediverse handle when available', () => {
		renderWithProvider( <ListSitesDirectory items={ mockItems } followSource="reader-list" /> );

		expect( screen.getByText( '@smittenkitchen@smittenkitchen.com' ) ).toBeVisible();
		expect(
			screen.getByRole( 'link', { name: '@smittenkitchen@smittenkitchen.com' } )
		).toHaveAttribute( 'href', 'https://smittenkitchen.com/@smittenkitchen' );
	} );

	test( 'does not show fediverse handle when null', () => {
		renderWithProvider(
			<ListSitesDirectory items={ [ mockItems[ 1 ] ] } followSource="reader-list" />
		);

		expect( screen.queryByText( /@.*@/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders empty state when items is empty', () => {
		renderWithProvider( <ListSitesDirectory items={ [] } followSource="reader-list" /> );

		expect( screen.getByText( /no sites/i ) ).toBeVisible();
	} );
} );
