/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { SiteIconsRow } from '../index';

const mockItems = [
	{ site_name: 'Smitten Kitchen', site_icon: 'https://example.com/sk.png' },
	{ site_name: 'Another Blog', site_icon: 'https://example.com/ab.png' },
	{ site_name: 'No Icon Site', site_icon: null },
];

describe( 'SiteIconsRow', () => {
	test( 'renders an icon for each item', () => {
		render( <SiteIconsRow items={ mockItems } totalCount={ 3 } /> );

		const images = screen.getAllByRole( 'img' );
		expect( images ).toHaveLength( 2 );
		expect( images[ 0 ] ).toHaveAttribute( 'alt', 'Smitten Kitchen' );
	} );

	test( 'renders initials fallback when site_icon is null', () => {
		render( <SiteIconsRow items={ mockItems } totalCount={ 3 } /> );

		expect( screen.getByText( 'No' ) ).toBeVisible();
	} );

	test( 'caps displayed icons at 10', () => {
		const manyItems = Array.from( { length: 15 }, ( _, i ) => ( {
			site_name: `Site ${ i }`,
			site_icon: `https://example.com/${ i }.png`,
		} ) );

		render( <SiteIconsRow items={ manyItems } totalCount={ 15 } /> );

		const images = screen.getAllByRole( 'img' );
		expect( images ).toHaveLength( 10 );
	} );

	test( 'shows +N overflow bubble when totalCount exceeds displayed icons', () => {
		render( <SiteIconsRow items={ mockItems } totalCount={ 25 } /> );

		expect( screen.getByText( '+22' ) ).toBeVisible();
	} );

	test( 'does not show overflow bubble when totalCount equals item count', () => {
		render( <SiteIconsRow items={ mockItems } totalCount={ 3 } /> );

		expect( screen.queryByText( /\+\d+/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when items is empty', () => {
		const { container } = render( <SiteIconsRow items={ [] } totalCount={ 0 } /> );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
