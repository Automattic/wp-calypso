import { render, screen } from '@testing-library/react';
import { Badge } from '..';

describe( 'Badge', () => {
	it( 'should render as a span', () => {
		render( <Badge>Code is Poetry</Badge> );
		const badge = screen.getByText( 'Code is Poetry' );
		expect( badge.tagName ).toBe( 'SPAN' );
	} );

	it( 'should pass through additional props', () => {
		render(
			<Badge data-testid="custom-data-attr" className="custom-class">
				Code is Poetry
			</Badge>
		);
		const badge = screen.getByTestId( 'custom-data-attr' );
		expect( badge ).toHaveClass( 'custom-class' );
	} );
} );
