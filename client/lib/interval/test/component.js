require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
import { assert } from 'chai';
import * as sinon from 'sinon';
import React from 'react';
import { mount, shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Interval, { EVERY_SECOND, EVERY_MINUTE } from '../index';
import { add, resetForTesting as reset } from '../runner';

const noop = () => null;
const nudgeObject = ( o, v ) => () => ( o.counter += v );

describe( 'Interval', function() {
	before( function() {
		this.clock = sinon.useFakeTimers();
	} );

	after( function() {
		this.clock.restore();
	} );

	describe( 'Rendering and children', function() {
		it( 'Should render an empty span with no children', function() {
			const wrapper = shallow( <Interval onTick={ noop } period={ EVERY_SECOND }/> );

			assert( '' === wrapper.text() );
		} );

		it( 'Should render children', function() {
			const wrapper = shallow( <Interval onTick={ noop } period={ EVERY_SECOND }><div>test</div></Interval> );

			assert( wrapper.contains( <div>test</div> ) );
		} );

		it( 'Should pass props to children', function() {
			const PropConsumer = React.createClass( { render() { return <div>{ this.props.prop }</div>; } } );
			const wrapper = shallow( <Interval prop={ 42 } onTick={ noop } period={ EVERY_SECOND }><PropConsumer /></Interval> );

			assert( 42 === wrapper.find( PropConsumer ).prop( 'prop' ) );
		} );
	} );

	describe( 'Running actions', function() {
		beforeEach( function() {
			reset();
		} );

		it( 'Should add the given action', function() {
			const id = add( EVERY_MINUTE, noop );
			mount( <Interval onTick={ noop } period={ EVERY_SECOND }><div /></Interval> );

			// verifies that the nextId incremented, signalling that the action was added
			assert( id + 2 === add( EVERY_MINUTE, noop ) );
		} );

		it( 'Runs onTick()', function() {
			const o = { counter: 0 };
			mount( <Interval onTick={ nudgeObject( o, 1 ) } period={ EVERY_SECOND }><div /></Interval> );

			assert( 0 === o.counter );

			this.clock.tick( 1000 );
			assert( 1 === o.counter );
		} );

		it( 'Changes the callback on prop changes', function() {
			const o = { counter: 0 };
			const wrapper = mount( <Interval onTick={ nudgeObject( o, 1 ) } period={ EVERY_SECOND }><div /></Interval> );

			this.clock.tick( 1000 );
			wrapper.setProps( { period: EVERY_MINUTE } );

			this.clock.tick( 1000 );
			assert( 1 === o.counter );

			this.clock.tick( 1000 * 60 );
			assert( 2 === o.counter );

			wrapper.setProps( { onTick: noop } );
			this.clock.tick( 1000 * 60 );
			assert( 2 === o.counter );
		} );

		it( 'Adds the action when mounted', function() {
			const o = { counter: 0 };
			const wrapper = mount( <div></div> );

			this.clock.tick( 1000 );
			assert( 0 === o.counter );

			wrapper.setProps( { children: <Interval onTick={ nudgeObject( o, 1 ) } period={ EVERY_SECOND }><div /></Interval> } );

			this.clock.tick( 1000 );
			assert( 1 === o.counter );
		} );

		it( 'Removes the action when unMounted', function() {
			const o = { counter: 0 };
			const wrapper = mount( <div><Interval onTick={ nudgeObject( o, 1 ) } period={ EVERY_SECOND }><div /></Interval></div> );

			this.clock.tick( 1000 );
			assert( 1 === o.counter );

			wrapper.setProps( { children: null } );

			this.clock.tick( 1000 );
			assert( 1 === o.counter );
		} );
	} );
} );
