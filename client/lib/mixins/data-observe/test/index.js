/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["assertMixin", "assert.*"] }] */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
/* eslint-disable no-restricted-imports */
import observe from 'calypso/lib/mixins/data-observe';
/* eslint-enable no-restricted-imports */

describe( 'observe()', () => {
	test( 'should return proper mixin with no arguments', () => {
		assertMixin( observe() );
	} );
	test( 'should return proper mixin with one argument', () => {
		assertMixin( observe( 'baba' ) );
	} );
	test( 'should return proper mixin with more than one argument', () => {
		assertMixin( observe( 'baba', 'dyado', 'winkwink' ) );
	} );

	describe( 'componentDidMount()', () => {
		test( 'should call .on() on the props with the names as arguments', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext( 'baba', 'dyado', 'pancho' );
			mixin.componentDidMount.call( context );
			assert.deepEqual( [ 'baba', 'dyado' ], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
		test( 'should not call .on() if the props are missing', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext( 'wink', 'blurp', 'foo' );
			mixin.componentDidMount.call( context );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
	} );

	describe( 'componentWillUnmount', () => {
		test( 'should call .off() on the props with the names as arguments', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext( 'baba', 'non-existant' );
			mixin.componentWillUnmount.call( context );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [ 'baba' ], context.offCalls );
		} );
		test( 'should not call .off() on the props if the props are missing', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext( 'non-existant' );
			mixin.componentWillUnmount.call( context );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
	} );

	describe( 'componentWillReceiveProps', () => {
		test( 'should not do anything if props did not change', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext( 'baba', 'dyado', 'wink' );
			mixin.UNSAFE_componentWillReceiveProps.call( context, context.props );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
		test( 'should re-bind the event handlers if the props reference changed', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext( 'baba', 'dyado' );
			mixin.UNSAFE_componentWillReceiveProps.call( context, {
				baba: context.props.baba,
				dyado: mockEventEmitter( context, 'dyado' ),
			} );
			assert.deepEqual( [ 'dyado' ], context.onCalls );
			assert.deepEqual( [ 'dyado' ], context.offCalls );
		} );
		test( 'should only unbind the event if the prop goes missing, but not bind it', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext( 'baba', 'dyado' );
			mixin.UNSAFE_componentWillReceiveProps.call( context, { baba: context.props.baba } );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [ 'dyado' ], context.offCalls );
		} );
		test( 'should only bind the event if the prop appears, but not unbind it', () => {
			const mixin = observe( 'baba', 'dyado' );
			const context = mockContext();
			mixin.UNSAFE_componentWillReceiveProps.call( context, {
				baba: mockEventEmitter( context, 'baba' ),
			} );
			assert.deepEqual( [ 'baba' ], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
	} );
} );

function mockContext() {
	const propNames = Array.prototype.slice.call( arguments );
	const context = {
		onCalls: [],
		offCalls: [],
		props: {},
		update: 'callback',
	};
	propNames.forEach( function ( name ) {
		context.props[ name ] = mockEventEmitter( context, name );
	} );
	return context;
}

function mockEventEmitter( context, name ) {
	return {
		on: function ( event, callback ) {
			context.onCalls.push( name );
			assert.deepEqual( 'change', event );
			assert.deepEqual( 'callback', callback );
		},
		off: function ( event, callback ) {
			context.offCalls.push( name );
			assert.deepEqual( 'change', event );
			assert.deepEqual( 'callback', callback );
		},
	};
}

function assertMixin( mixin ) {
	assert.isFunction( mixin.componentDidMount );
	assert.isFunction( mixin.componentWillUnmount );
	assert.isFunction( mixin.UNSAFE_componentWillReceiveProps );
}
