/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CoreBadge as _Badge } from '..';

const testid = 'my-badge';
const Badge = ( props: React.ComponentProps< typeof _Badge > ) => (
	<_Badge data-testid={ testid } { ...props } />
);

describe( 'Badge', () => {
	it( 'should render as a span', () => {
		render( <Badge>Code is Poetry</Badge> );
		const badge = screen.getByTestId( testid );
		expect( badge ).toBeInTheDocument();
		expect( badge.tagName ).toBe( 'SPAN' );
	} );

	it( 'should pass through a custom class name', () => {
		render( <Badge className="custom-class">Code is Poetry</Badge> );
		const badge = screen.getByTestId( testid );
		expect( badge ).toHaveClass( 'custom-class' );
	} );

	it( 'should pass through additional props', () => {
		render( <Badge data-testid="custom-badge">Code is Poetry</Badge> );
		const badge = screen.getByTestId( 'custom-badge' );
		expect( badge ).toHaveTextContent( 'Code is Poetry' );
	} );
} );
