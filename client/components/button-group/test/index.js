/** @format */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe( 'ButtonGroup', () => {
	let sandbox, ButtonGroup, Button;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
		sandbox.stub( console, 'error' );
		sandbox.stub( console, 'log' );

		ButtonGroup = require( '../index' );
		Button = require( 'components/button' );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	test( 'should have ButtonGroup class', () => {
		const buttonGroup = shallow( <ButtonGroup /> );
		expect( 1 ).toEqual( buttonGroup.find( '.button-group' ).length );
	} );

	test( 'should contains the same number of .button nodes than <Button>s it receives', () => {
		const buttonGroup = shallow(
			<ButtonGroup>
				<Button>test</Button>
				<Button>test2</Button>
			</ButtonGroup>
		);
		expect( 2 ).toEqual( buttonGroup.find( Button ).length );
	} );

	test( 'should get the busy `is-busy` class when passed the `busy` prop', () => {
		const buttonGroup = shallow( <ButtonGroup busy /> );
		expect( 1 ).toEqual( buttonGroup.find( '.is-busy' ).length );
	} );

	test( 'should throw an error if any of the children is not a <Button>', () => {
		shallow(
			<ButtonGroup>
				<div id="test">test</div>
			</ButtonGroup>
		);

		/* eslint-disable no-console */
		sinon.assert.calledWithMatch( console.error, 'All children elements should be a Button.' );
		/* eslint-enable no-console */
	} );
} );
