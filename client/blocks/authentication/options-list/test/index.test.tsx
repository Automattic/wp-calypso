/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import OptionsList from '../index';

describe( 'OptionsList', () => {
	test( 'renders children inside a group', () => {
		render(
			<OptionsList>
				<button type="button">First</button>
				<button type="button">Second</button>
			</OptionsList>
		);

		const group = screen.getByRole( 'group' );
		expect( group ).toBeVisible();
		expect( group ).toContainElement( screen.getByRole( 'button', { name: 'First' } ) );
		expect( group ).toContainElement( screen.getByRole( 'button', { name: 'Second' } ) );
	} );

	test( 'preserves children order', () => {
		render(
			<OptionsList>
				<button type="button">First</button>
				<button type="button">Second</button>
				<button type="button">Third</button>
			</OptionsList>
		);

		const buttons = screen.getAllByRole( 'button' );
		expect( buttons[ 0 ] ).toHaveTextContent( 'First' );
		expect( buttons[ 1 ] ).toHaveTextContent( 'Second' );
		expect( buttons[ 2 ] ).toHaveTextContent( 'Third' );
	} );
} );
