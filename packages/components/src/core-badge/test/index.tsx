/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CoreBadge } from '..';

describe( 'Badge', () => {
	it( 'should render as a span', () => {
		render( <CoreBadge>Code is Poetry</CoreBadge> );
		const badge = screen.getByText( 'Code is Poetry' );
		expect( badge.tagName ).toBe( 'SPAN' );
	} );

	it( 'should pass through additional props', () => {
		render(
			<CoreBadge data-testid="custom-data-attr" className="custom-class">
				Code is Poetry
			</CoreBadge>
		);
		const badge = screen.getByTestId( 'custom-data-attr' );
		expect( badge ).toHaveClass( 'custom-class' );
	} );
} );
