/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

describe( 'ButtonGroup', function() {
	let sandbox, ButtonGroup, Button;

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
		sandbox.stub( console, 'error' );
		sandbox.stub( console, 'log' );

		ButtonGroup = require( '../index' );
		Button = require( 'components/button' );
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	it( 'should have ButtonGroup class', function() {
		const buttonGroup = shallow( <ButtonGroup /> );
		assert.equal( 1, buttonGroup.find( '.button-group' ).length );
	} );

	it( 'should contains the same number of .button nodes than <Button>s it receives', function() {
		const buttonGroup = shallow( <ButtonGroup><Button>test</Button><Button>test2</Button></ButtonGroup> );
		assert.equal( 2, buttonGroup.find( Button ).length );
	} );

	it( 'should throw an error if any of the children is not a <Button>', function() {
		shallow( <ButtonGroup><div id="test">test</div></ButtonGroup> );

		/* eslint-disable no-console */
		sinon.assert.calledWithMatch( console.error, 'All children elements should be a Button.' );
		/* eslint-enable no-console */
	} );
} );
