/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Suggestions from '..';

const defaultProps = {
	suggest: vi.fn(),
	suggestions: [
		{
			label: 'Apple',
		},
		{
			label: 'Pear',
		},
		{
			label: 'Orange',
		},
	],
};

describe( '<Suggestions>', () => {
	afterEach( () => {
		vi.resetAllMocks();
	} );

	test( 'render basic list of suggestions', () => {
		const { container } = render( <Suggestions { ...defaultProps } /> );

		expect( screen.getAllByRole( 'button' ) ).toHaveLength( 3 );

		expect( container.firstChild ).toMatchSnapshot();
	} );

	test( 'highlights the query inside the suggestions', () => {
		render( <Suggestions { ...defaultProps } query="LE" /> );

		const suggestions = screen.getAllByRole( 'button' );

		expect( suggestions[ 0 ] ).toHaveTextContent( 'Apple' );
		expect( suggestions[ 1 ] ).toHaveTextContent( 'Pear' );
		expect( suggestions[ 2 ] ).toHaveTextContent( 'Orange' );

		expect( suggestions[ 0 ] ).toHaveClass( 'has-highlight' );
		expect( suggestions[ 1 ] ).not.toHaveClass( 'has-highlight' );
		expect( suggestions[ 2 ] ).not.toHaveClass( 'has-highlight' );

		expect( screen.getByText( 'le' ) ).toHaveClass( 'is-emphasized' );
	} );

	test( 'uncategorized suggestions always appear first', () => {
		render(
			<Suggestions
				{ ...defaultProps }
				suggestions={ [ { label: 'Carrot', category: 'Vegetable' }, ...defaultProps.suggestions ] }
			/>
		);

		const suggestions = screen.getAllByRole( 'button' );

		expect( suggestions[ 0 ] ).toHaveTextContent( 'Apple' );
		expect( suggestions[ 1 ] ).toHaveTextContent( 'Pear' );
		expect( suggestions[ 2 ] ).toHaveTextContent( 'Orange' );
		expect( suggestions[ 3 ] ).toHaveTextContent( 'Carrot' );
	} );
} );
