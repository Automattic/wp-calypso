/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import { expect } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import trackClicks from '..';
import useFakeDom from 'test/helpers/use-fake-dom';
import { GUIDED_TOUR_TRACKED_CLICK } from 'state/action-types.js';

const store = {
	dispatch: sinon.spy(),
	getState: noop,
	subscribe: noop,
};

const Foo = ( { onClick = noop } ) => (
	<div className="test__foo" onClick={ onClick }>
		This is Foo component.
	</div>
);

const TrackedFoo = trackClicks(
	( props ) => ( { fooId: props.fooId } )
)( Foo );

describe( 'trackClicks', () => {
	let node;
	let onClick;

	useFakeDom();

	beforeEach( () => {
		onClick = sinon.spy();
		const element = TestUtils.renderIntoDocument(
				React.createElement( TrackedFoo, {
					store,
					onClick,
					fooId: 42
				} ) );
		node = ReactDom.findDOMNode( element );
	} );

	it( 'renders the original component with no wrapping', () => {
		expect( node ).to.not.be.null;
		expect( node.nodeName ).to.equal( 'DIV' );
		expect( node.className ).to.equal( 'test__foo' );
	} );

	it( 'tracks clicks on the element by dispatching actions', () => {
		expect( store.dispatch.calledOnce ).to.be.false;
		TestUtils.Simulate.click( node );
		expect( store.dispatch.calledOnce ).to.be.true;

		const dispatched = store.dispatch.getCall( 0 ).args[ 0 ];
		expect( dispatched.type ).to.equal( GUIDED_TOUR_TRACKED_CLICK );
	} );

	it( 'respects the component\'s own `onClick`', () => {
		TestUtils.Simulate.click( node );
		expect( onClick.calledOnce ).to.be.true;
	} );

	it( 'dispatches relevant properties from the component', () => {
		TestUtils.Simulate.click( node );
		const dispatched = store.dispatch.getCall( 0 ).args[ 0 ];
		expect( Object.keys( dispatched ).length ).to.equal( 3 );
		expect( dispatched.fooId ).to.equal( 42 );
	} );
} );
