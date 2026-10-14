/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { DesignYourOwnCard } from '../design-your-own-card';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useResizeObserver:
		( callback: ( entries: { target: HTMLElement; contentRect: { width: number } }[] ) => void ) =>
		( element: HTMLElement | null ) => {
			if ( element ) {
				callback( [ { target: element, contentRect: { width: 342 } } ] );
			}
		},
} ) );

let mockSite: { slug: string } | null = { slug: 'example.wordpress.com' };
jest.mock( '../eligibility', () => ( { useRedesignEligibility: () => mockSite } ) );
test( 'offers a real redesign route with Personal availability', () => {
	render( <DesignYourOwnCard /> );
	expect( screen.getByRole( 'link', { name: 'Built with the WordPress Agent' } ) ).toHaveAttribute(
		'href',
		'/site-redesign/example.wordpress.com?start-designing=1'
	);
	expect( screen.getByText( 'Built with the WordPress Agent' ) ).toBeVisible();
	expect( screen.getByText( 'Available on Personal' ) ).toBeVisible();
	const availability = screen.getByText( 'Available on Personal' ).closest( '.premium-badge' );
	expect( availability ).not.toBeNull();
	expect( availability ).not.toHaveAttribute( 'role', 'button' );
} );
test( 'does not offer redesign when backend eligibility is unavailable', () => {
	mockSite = null;
	render( <DesignYourOwnCard /> );
	expect( screen.queryByRole( 'link' ) ).toBeNull();
} );

test( 'uses native Card and WordPress Button with a DOM skeleton and valid navigation', () => {
	mockSite = { slug: 'example.wordpress.com' };
	const { container } = render( <DesignYourOwnCard /> );
	expect( screen.getByRole( 'article' ) ).toHaveClass( 'card' );
	expect(
		screen.getByRole( 'article' ).style.getPropertyValue( '--site-redesign-card-width' )
	).toBe( '342px' );
	expect( screen.getByRole( 'link', { name: 'Built with the WordPress Agent' } ) ).toHaveClass(
		'components-button'
	);
	expect( container.querySelectorAll( '.site-redesign-card__skeleton > div' ) ).toHaveLength( 14 );
	expect( container.querySelector( 'img' ) ).toBeNull();
	expect( container.querySelector( 'a a, a button, button a' ) ).toBeNull();
	expect( screen.getByRole( 'link', { name: 'Design Your Own' } ) ).toHaveAttribute(
		'href',
		'/site-redesign/example.wordpress.com?start-designing=1'
	);
} );
