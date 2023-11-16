/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from '../index';

describe( 'Badge', () => {
	test( 'should have badge class', () => {
		const { container } = render( <Badge /> );
		expect( container.getElementsByClassName( 'badge' ).length ).toBe( 1 );
	} );

	test( 'should have proper type class (warning)', () => {
		const { container } = render( <Badge type="warning" /> );
		expect( container.getElementsByClassName( 'badge badge--warning' ).length ).toBe( 1 );
	} );

	test( 'should have proper type class (success)', () => {
		const { container } = render( <Badge type="success" /> );
		expect( container.getElementsByClassName( 'badge badge--success' ).length ).toBe( 1 );
	} );

	test( 'should have proper type class (info)', () => {
		const { container } = render( <Badge type="info" /> );
		expect( container.getElementsByClassName( 'badge badge--info' ).length ).toBe( 1 );
	} );

	test( 'should have proper type class (info-blue)', () => {
		const { container } = render( <Badge type="info-blue" /> );
		expect( container.getElementsByClassName( 'badge badge--info-blue' ).length ).toBe( 1 );
	} );

	test( 'should have proper type class (error)', () => {
		const { container } = render( <Badge type="error" /> );
		expect( container.getElementsByClassName( 'badge badge--error' ).length ).toBe( 1 );
	} );

	test( 'should have proper type class (default)', () => {
		const { container } = render( <Badge /> );
		expect( container.getElementsByClassName( 'badge badge--warning' ).length ).toBe( 1 );
	} );

	test( 'should contains the passed children wrapped by a feature-example div', () => {
		render(
			<Badge>
				<div>arbitrary-text-content</div>
			</Badge>
		);
		expect( screen.getByText( 'arbitrary-text-content' ) ).toBeInTheDocument();
	} );
} );
