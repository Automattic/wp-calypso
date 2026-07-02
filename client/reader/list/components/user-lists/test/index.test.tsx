/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { UserLists } from '..';
import type { List } from 'calypso/reader/list-manage/types';

jest.mock( 'calypso/components/empty-content', () => ( { line }: { line: React.ReactNode } ) => (
	<div data-testid="empty-content">{ line }</div>
) );

describe( 'UserLists', () => {
	test( 'renders the loader when isLoading', () => {
		const { container } = render( <UserLists lists={ [] } isLoading /> );
		expect( container.querySelector( '.wp-spinner-wrapper' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Loading lists...' ) ).toBeVisible();
	} );

	test( 'renders the default empty state when there are no lists', () => {
		render( <UserLists lists={ [] } isLoading={ false } /> );
		expect( screen.getByTestId( 'empty-content' ) ).toHaveTextContent( 'No lists yet.' );
	} );

	test( 'renders lists as links and overrides the recommended-blogs description', () => {
		const lists: List[] = [
			{
				ID: 1,
				title: 'A',
				description: 'desc a',
				slug: 'a',
				owner: 'bob',
				is_public: true,
				is_owner: false,
			},
			{
				ID: 2,
				title: 'Recommended Blogs',
				description: '',
				slug: 'recommended-blogs',
				owner: 'bob',
				is_public: true,
				is_owner: false,
			},
		];
		render( <UserLists lists={ lists } isLoading={ false } /> );

		expect( screen.getByText( 'desc a' ) ).toBeVisible();
		expect( screen.getByText( 'A list of blogs recommended by @bob.' ) ).toBeVisible();
		const links = Array.from(
			document.querySelectorAll< HTMLAnchorElement >( 'a.summary-button' )
		);
		expect( links.map( ( l ) => l.getAttribute( 'href' ) ) ).toEqual( [
			'/reader/list/bob/a',
			'/reader/list/bob/recommended-blogs',
		] );
	} );

	test( 'falls back to "No description." when a list has no description', () => {
		const lists: List[] = [
			{
				ID: 1,
				title: 'A',
				description: '',
				slug: 'a',
				owner: 'bob',
				is_public: true,
				is_owner: false,
			},
		];
		render( <UserLists lists={ lists } isLoading={ false } /> );
		expect( screen.getByText( 'No description.' ) ).toBeVisible();
	} );
} );
