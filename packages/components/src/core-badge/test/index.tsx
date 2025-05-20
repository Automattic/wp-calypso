/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';

/**
 * Internal dependencies
 */
import _Badge from '..';

const testid = 'my-badge';
const Badge = ( props: React.ComponentProps< typeof _Badge > ) => (
	<_Badge data-testid={ testid } { ...props } />
);

describe( 'Badge', () => {
	it( 'should render correctly with default props', () => {
		render( <Badge>Code is Poetry</Badge> );
		const badge = screen.getByTestId( testid );
		expect( badge ).toBeInTheDocument();
		expect( badge.tagName ).toBe( 'SPAN' );
		expect( badge ).toHaveClass( 'components-badge' );
	} );

	it( 'should render as per its intent and contain an icon', () => {
		render( <Badge intent="error">Code is Poetry</Badge> );
		const badge = screen.getByTestId( testid );
		expect( badge ).toHaveClass( 'components-badge', 'is-error' );
		expect( badge ).toHaveClass( 'has-icon' );
	} );

	it( 'should combine custom className with default class', () => {
		render( <Badge className="custom-class">Code is Poetry</Badge> );
		const badge = screen.getByTestId( testid );
		expect( badge ).toHaveClass( 'components-badge' );
		expect( badge ).toHaveClass( 'custom-class' );
	} );

	it( 'should pass through additional props', () => {
		render( <Badge data-testid="custom-badge">Code is Poetry</Badge> );
		const badge = screen.getByTestId( 'custom-badge' );
		expect( badge ).toHaveTextContent( 'Code is Poetry' );
		expect( badge ).toHaveClass( 'components-badge' );
	} );
} );
