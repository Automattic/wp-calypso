/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

describe( 'ButtonGroup', () => {
	let ButtonGroup, consoleErrorSpy;

	beforeAll( async () => {
		consoleErrorSpy = jest.spyOn( global.console, 'error' ).mockImplementation();

		ButtonGroup = ( await import( '../index' ) ).default;
	} );

	afterAll( () => {
		consoleErrorSpy.mockRestore();
	} );

	test( 'should have ButtonGroup class', () => {
		const buttonGroup = shallow( <ButtonGroup /> );
		assert.equal( 1, buttonGroup.find( '.button-group' ).length );
	} );

	test( 'should contains the same number of .button nodes than <Button>s it receives', () => {
		const buttonGroup = shallow(
			<ButtonGroup>
				<Button>test</Button>
				<Button>test2</Button>
			</ButtonGroup>
		);
		assert.equal( 2, buttonGroup.find( Button ).length );
	} );

	test( 'should get the busy `is-busy` class when passed the `busy` prop', () => {
		const buttonGroup = shallow( <ButtonGroup busy /> );
		assert.equal( 1, buttonGroup.find( '.is-busy' ).length );
	} );

	test( 'should throw an error if any of the children is not a <Button>', () => {
		shallow(
			<ButtonGroup>
				<div id="test">test</div>
			</ButtonGroup>
		);

		expect( consoleErrorSpy ).toHaveBeenCalledWith(
			expect.stringContaining( 'All children elements should be a Button.' )
		);
	} );
} );
