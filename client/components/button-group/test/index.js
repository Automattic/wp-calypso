/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ButtonGroup from '..';

describe( 'ButtonGroup', () => {
	test( 'should have ButtonGroup class', () => {
		const buttonGroup = shallow( <ButtonGroup /> );
		expect( buttonGroup.find( '.button-group' ) ).toHaveLength( 1 );
	} );

	test( 'should contains the same number of .button nodes than <Button>s it receives', () => {
		const buttonGroup = shallow(
			<ButtonGroup>
				<Button>test</Button>
				<Button>test2</Button>
			</ButtonGroup>
		);
		expect( buttonGroup.find( Button ) ).toHaveLength( 2 );
	} );

	test( 'should get the busy `is-busy` class when passed the `busy` prop', () => {
		const buttonGroup = shallow( <ButtonGroup busy /> );
		expect( buttonGroup.find( '.is-busy' ) ).toHaveLength( 1 );
	} );

	test( 'should throw an error if any of the children is not a <Button>', () => {
		const consoleErrorSpy = jest.spyOn( global.console, 'error' ).mockImplementation();

		shallow(
			<ButtonGroup>
				<div id="test">test</div>
			</ButtonGroup>
		);

		expect( consoleErrorSpy ).toHaveBeenCalledWith(
			expect.stringContaining( 'All children elements should be a Button.' )
		);
		consoleErrorSpy.mockRestore();
	} );
} );
