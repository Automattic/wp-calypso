/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' );

describe( 'observe()', function() {
	it( 'should return proper mixin with no arguments', function() {
		assertMixin( observe() );
	} );
	it( 'should return proper mixin with one argument', function() {
		assertMixin( observe( 'baba' ) );
	} );
	it( 'should return proper mixin with more than one argument', function() {
		assertMixin( observe( 'baba', 'dyado', 'winkwink' ) );
	} );

	describe( 'componentDidMount()', function() {
		it( 'should call .on() on the props with the names as arguments', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado', 'pancho' );
			mixin.componentDidMount.call( context );
			assert.deepEqual( [ 'baba', 'dyado' ], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
		it( 'should not call .on() if the props are missing', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'wink', 'blurp', 'foo' );
			mixin.componentDidMount.call( context );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
	} );

	describe( 'componentWillUnmount', function() {
		it( 'should call .off() on the props with the names as arguments', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'non-existant' );
				mixin.componentWillUnmount.call( context );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [ 'baba' ], context.offCalls );
		} );
		it( 'should not call .off() on the props if the props are missing', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'non-existant' );
				mixin.componentWillUnmount.call( context );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
	} );

	describe( 'componentWillReceiveProps', function() {
		it( 'should not do anything if props did not change', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado', 'wink' );
				mixin.componentWillReceiveProps.call( context, context.props );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
		it( 'should re-bind the event handlers if the props reference changed', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado' );
				mixin.componentWillReceiveProps.call( context, {baba: context.props.baba, dyado: mockEventEmitter( context, 'dyado' )} );
			assert.deepEqual( [ 'dyado' ], context.onCalls );
			assert.deepEqual( [ 'dyado' ], context.offCalls );
		} );
		it( 'should only unbind the event if the prop goes missing, but not bind it', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado' );
				mixin.componentWillReceiveProps.call( context, {baba: context.props.baba} );
			assert.deepEqual( [], context.onCalls );
			assert.deepEqual( [ 'dyado' ], context.offCalls );
		} );
		it( 'should only bind the event if the prop appears, but not unbind it', function() {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext();
				mixin.componentWillReceiveProps.call( context, {baba: mockEventEmitter( context, 'baba' )} );
			assert.deepEqual( [ 'baba' ], context.onCalls );
			assert.deepEqual( [], context.offCalls );
		} );
	} );
} );

function mockContext() {
	var propNames = Array.prototype.slice.call( arguments ),
		context = {
			onCalls: [],
			offCalls: [],
			props: {},
			update: 'callback'
		};
	propNames.forEach( function( name ) {
		context.props[ name ] = mockEventEmitter( context, name );
	} );
	return context;
}

function mockEventEmitter( context, name ) {
	return {
		on: function( event, callback ) {
			context.onCalls.push( name );
			assert.deepEqual( 'change', event );
			assert.deepEqual( 'callback', callback );
		},
		off: function( event, callback ) {
			context.offCalls.push( name );
			assert.deepEqual( 'change', event );
			assert.deepEqual( 'callback', callback );
		}
	};
}

function assertMixin( mixin ) {
	assert.isFunction( mixin.componentDidMount );
	assert.isFunction( mixin.componentWillUnmount );
	assert.isFunction( mixin.componentWillReceiveProps );
}
