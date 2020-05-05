/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React, { Component } from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import TrackInputChanges from '../';

/**
 * Module variables
 */
const spies = {
	onNewValue: null,
	onChange: null,
	onBlur: null,
};

class DummyInput extends Component {
	triggerChange = ( value ) => {
		this.props.onChange( { target: this, value } );
	};

	triggerBlur = () => {
		this.props.onBlur( { target: this } );
	};

	render() {
		return <div />;
	}
}

describe( 'TrackInputChanges#onNewValue', () => {
	let tree, dummyInput, container;

	beforeAll( () => {
		container = document.createElement( 'div' );
	} );

	afterEach( () => {
		ReactDom.unmountComponentAtNode( container );
	} );

	beforeEach( () => {
		for ( const spy in spies ) {
			spies[ spy ] = sinon.spy();
		}
		tree = ReactDom.render(
			<TrackInputChanges onNewValue={ spies.onNewValue }>
				<DummyInput onChange={ spies.onChange } onBlur={ spies.onBlur } />
			</TrackInputChanges>,
			container
		);
		dummyInput = TestUtils.findRenderedComponentWithType( tree, DummyInput );
		// Rendering appears to trigger a 'change' event on the input
		TestUtils.findRenderedComponentWithType( tree, TrackInputChanges ).inputEdited = false;
	} );

	test( 'should pass through callbacks but not trigger on a change event', () => {
		dummyInput.triggerChange( 'abc' );

		expect( spies.onNewValue ).to.have.callCount( 0 );
		expect( spies.onChange ).to.have.callCount( 1 );
		expect( spies.onBlur ).to.have.callCount( 0 );
	} );

	test( 'should pass through callbacks but not trigger on a blur event', () => {
		dummyInput.triggerBlur();

		expect( spies.onNewValue ).to.have.callCount( 0 );
		expect( spies.onChange ).to.have.callCount( 0 );
		expect( spies.onBlur ).to.have.callCount( 1 );
	} );

	test( 'should pass through callbacks and trigger on a change then a blur', () => {
		dummyInput.triggerChange( 'abc' );
		dummyInput.triggerBlur();

		expect( spies.onNewValue ).to.have.callCount( 1 );
		expect( spies.onChange ).to.have.callCount( 1 );
		expect( spies.onBlur ).to.have.callCount( 1 );
	} );

	test( 'should trigger once on each blur event only if value changed', () => {
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

	test( 'should throw if multiple child elements', () => {
		expect( () =>
			ReactDom.render(
				<TrackInputChanges onNewValue={ spies.onNewValue }>
					<DummyInput onChange={ spies.onChange } onBlur={ spies.onBlur } />
					<DummyInput onChange={ spies.onChange } onBlur={ spies.onBlur } />
				</TrackInputChanges>,
				container
			)
		).to.throw;
	} );
} );
