/**
 * @jest-environment jsdom
 */
import { Button } from '@automattic/components';
import { render, screen } from '@testing-library/react';
import ButtonGroup from '..';

describe( 'ButtonGroup', () => {
	test( 'should have ButtonGroup class', () => {
		render( <ButtonGroup /> );
		expect( screen.getByRole( 'group' ) ).toHaveClass( 'button-group' );
	} );
	test( 'should contains the same number of .button nodes than <Button>s it receives', () => {
		render(
			<ButtonGroup>
				<Button>test</Button>
				<Button>test2</Button>
			</ButtonGroup>
		);
		expect( screen.getAllByRole( 'button' ) ).toHaveLength( 2 );
	} );
	test( 'should get the busy `is-busy` class when passed the `busy` prop', () => {
		render( <ButtonGroup busy /> );
		expect( screen.getByRole( 'group' ) ).toHaveClass( 'is-busy' );
	} );
} );
