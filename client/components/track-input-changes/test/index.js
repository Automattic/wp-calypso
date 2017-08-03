/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';
import sinon from 'sinon';
import useFakeDom from 'test/helpers/use-fake-dom';

/**
 * Internal dependencies
 */
var TrackInputChanges = require( '../' );

/**
 * Module variables
 */
const spies = {
	onNewValue: null,
	onChange: null,
	onBlur: null
};

const DummyInput = React.createClass( {
	triggerChange( value ) {
		this.props.onChange( { target: this, value } );
	},

	triggerBlur() {
		this.props.onBlur( { target: this } );
	},

	render() {
		return <div />;
	}
} );

describe( 'TrackInputChanges#onNewValue', function() {
	let tree, dummyInput, container;

	useFakeDom.withContainer();

	before( () => {
		container = useFakeDom.getContainer();
	} );

	afterEach( () => {
		ReactDom.unmountComponentAtNode( container );
	} );

	beforeEach( function() {
		for ( let spy in spies ) {
			spies[ spy ] = sinon.spy();
		}
		tree = ReactDom.render(
			<TrackInputChanges onNewValue={ spies.onNewValue }>
				<DummyInput
					onChange={ spies.onChange }
					onBlur={ spies.onBlur }
				/>
			</TrackInputChanges>,
			container
		);
		dummyInput = TestUtils.findRenderedComponentWithType( tree, DummyInput );
		// Rendering appears to trigger a 'change' event on the input
		TestUtils.findRenderedComponentWithType( tree, TrackInputChanges ).inputEdited = false;
	} );

	it( 'should pass through callbacks but not trigger on a change event', function() {
		dummyInput.triggerChange( 'abc' );

		expect( spies.onNewValue ).to.have.callCount( 0 );
		expect( spies.onChange ).to.have.callCount( 1 );
		expect( spies.onBlur ).to.have.callCount( 0 );
	} );

	it( 'should pass through callbacks but not trigger on a blur event', function() {
		dummyInput.triggerBlur();

		expect( spies.onNewValue ).to.have.callCount( 0 );
		expect( spies.onChange ).to.have.callCount( 0 );
		expect( spies.onBlur ).to.have.callCount( 1 );
	} );

	it( 'should pass through callbacks and trigger on a change then a blur', function() {
		dummyInput.triggerChange( 'abc' );
		dummyInput.triggerBlur();

		expect( spies.onNewValue ).to.have.callCount( 1 );
		expect( spies.onChange ).to.have.callCount( 1 );
		expect( spies.onBlur ).to.have.callCount( 1 );
	} );

	it( 'should trigger once on each blur event only if value changed', function() {
		dummyInput.triggerBlur();
		dummyInput.triggerChange( 'abc' );
		dummyInput.triggerChange( 'abcd' );
		dummyInput.triggerBlur();
		dummyInput.triggerChange( 'abcde' );
		dummyInput.triggerChange( 'abcdef' );
		dummyInput.triggerBlur();
		dummyInput.triggerChange( 'abcdefg' );

		expect( spies.onNewValue ).to.have.callCount( 2 );
		expect( spies.onChange ).to.have.callCount( 5 );
		expect( spies.onBlur ).to.have.callCount( 3 );
	} );

	it( 'should throw if multiple child elements', function() {
		expect( () => ReactDom.render(
			<TrackInputChanges onNewValue={ spies.onNewValue }>
				<DummyInput
					onChange={ spies.onChange }
					onBlur={ spies.onBlur }
				/>
				<DummyInput
					onChange={ spies.onChange }
					onBlur={ spies.onBlur }
				/>
			</TrackInputChanges>,
			container
		) ).to.throw;
	} );
} );
