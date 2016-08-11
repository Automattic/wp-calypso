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
import TrackInteractions from '..';
import useFakeDom from 'test/helpers/use-fake-dom';
import { COMPONENT_INTERACTION_TRACKED } from 'state/action-types.js';

const store = {
	dispatch: noop,
	getState: noop,
	subscribe: noop,
};

const Foo = ( { onClick = noop } ) => (
	<div className="test__foo" onClick={ onClick }>
		This is Foo component.
	</div>
);

const mapPropsToAction = props => ( { fooId: props.foo.id } );

describe( 'TrackInteractions', () => {
	useFakeDom();

	describe( 'using default behavior', () => {
		let node;
		let onClick;

		before( () => {
			store.dispatch = sinon.spy();
		} );

		beforeEach( () => {
			onClick = sinon.spy();
			const element = TestUtils.renderIntoDocument(
				<TrackInteractions store={ store }>
					<Foo onClick={ onClick } foo={ { id: 42 } } />
				</TrackInteractions>
			);
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
			expect( dispatched.type ).to.equal( COMPONENT_INTERACTION_TRACKED );
		} );

		it( 'respects the component\'s own `onClick`', () => {
			TestUtils.Simulate.click( node );
			expect( onClick.calledOnce ).to.be.true;
		} );

		it( 'dispatches relevant properties from the component', () => {
			TestUtils.Simulate.click( node );
			const dispatched = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( Object.keys( dispatched ).sort() ).to.eql( [
				'component',
				'eventType',
				'type',
			] );
		} );
	} );

	describe( 'using `mapPropsToAction`', () => {
		let node;
		let onClick;

		before( () => {
			store.dispatch = sinon.spy();
		} );

		beforeEach( () => {
			onClick = sinon.spy();
			const element = TestUtils.renderIntoDocument(
				<TrackInteractions store={ store } mapPropsToAction={ mapPropsToAction }>
					<Foo onClick={ onClick } foo={ { id: 42 } } />
				</TrackInteractions>
			);
			node = ReactDom.findDOMNode( element );
		} );

		it( 'tracks clicks on the element by dispatching actions', () => {
			expect( store.dispatch.calledOnce ).to.be.false;
			TestUtils.Simulate.click( node );
			expect( store.dispatch.calledOnce ).to.be.true;

			const dispatched = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( dispatched.type ).to.equal( COMPONENT_INTERACTION_TRACKED );
		} );

		it( 'respects the component\'s own `onClick`', () => {
			TestUtils.Simulate.click( node );
			expect( onClick.calledOnce ).to.be.true;
		} );

		it( 'dispatches relevant properties from the component', () => {
			TestUtils.Simulate.click( node );
			const dispatched = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( Object.keys( dispatched ).sort() ).to.eql( [
				'component',
				'eventType',
				'fooId',
				'type',
			] );
			expect( dispatched.fooId ).to.equal( 42 );
		} );
	} );

	describe( 'using `fields`', () => {
		let node;
		let onClick;

		before( () => {
			store.dispatch = sinon.spy();
		} );

		beforeEach( () => {
			onClick = sinon.spy();
			const element = TestUtils.renderIntoDocument(
				<TrackInteractions store={ store } fields="foo.id">
					<Foo onClick={ onClick } foo={ { id: 42 } } />
				</TrackInteractions>
			);
			node = ReactDom.findDOMNode( element );
		} );

		it( 'tracks clicks on the element by dispatching actions', () => {
			expect( store.dispatch.calledOnce ).to.be.false;
			TestUtils.Simulate.click( node );
			expect( store.dispatch.calledOnce ).to.be.true;

			const dispatched = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( dispatched.type ).to.equal( COMPONENT_INTERACTION_TRACKED );
		} );

		it( 'respects the component\'s own `onClick`', () => {
			TestUtils.Simulate.click( node );
			expect( onClick.calledOnce ).to.be.true;
		} );

		it( 'dispatches relevant properties from the component', () => {
			TestUtils.Simulate.click( node );
			const dispatched = store.dispatch.getCall( 0 ).args[ 0 ];
			expect( Object.keys( dispatched ).sort() ).to.eql( [
				'component',
				'eventType',
				'foo.id',
				'type',
			] );
			expect( dispatched[ 'foo.id' ] ).to.equal( 42 );
		} );
	} );
} );
