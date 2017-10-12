/**
 * External dependencies
 *
 * @format
 */

import observe from 'lib/mixins/data-observe';
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
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado', 'pancho' );
			mixin.componentDidMount.call( context );
			expect( [ 'baba', 'dyado' ] ).toEqual( context.onCalls );
			expect( [] ).toEqual( context.offCalls );
		} );
		test( 'should not call .on() if the props are missing', () => {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'wink', 'blurp', 'foo' );
			mixin.componentDidMount.call( context );
			expect( [] ).toEqual( context.onCalls );
			expect( [] ).toEqual( context.offCalls );
		} );
	} );

	describe( 'componentWillUnmount', () => {
		test( 'should call .off() on the props with the names as arguments', () => {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'non-existant' );
			mixin.componentWillUnmount.call( context );
			expect( [] ).toEqual( context.onCalls );
			expect( [ 'baba' ] ).toEqual( context.offCalls );
		} );
		test( 'should not call .off() on the props if the props are missing', () => {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'non-existant' );
			mixin.componentWillUnmount.call( context );
			expect( [] ).toEqual( context.onCalls );
			expect( [] ).toEqual( context.offCalls );
		} );
	} );

	describe( 'componentWillReceiveProps', () => {
		test( 'should not do anything if props did not change', () => {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado', 'wink' );
			mixin.componentWillReceiveProps.call( context, context.props );
			expect( [] ).toEqual( context.onCalls );
			expect( [] ).toEqual( context.offCalls );
		} );
		test( 'should re-bind the event handlers if the props reference changed', () => {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado' );
			mixin.componentWillReceiveProps.call( context, {
				baba: context.props.baba,
				dyado: mockEventEmitter( context, 'dyado' ),
			} );
			expect( [ 'dyado' ] ).toEqual( context.onCalls );
			expect( [ 'dyado' ] ).toEqual( context.offCalls );
		} );
		test( 'should only unbind the event if the prop goes missing, but not bind it', () => {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext( 'baba', 'dyado' );
			mixin.componentWillReceiveProps.call( context, { baba: context.props.baba } );
			expect( [] ).toEqual( context.onCalls );
			expect( [ 'dyado' ] ).toEqual( context.offCalls );
		} );
		test( 'should only bind the event if the prop appears, but not unbind it', () => {
			var mixin = observe( 'baba', 'dyado' ),
				context = mockContext();
			mixin.componentWillReceiveProps.call( context, {
				baba: mockEventEmitter( context, 'baba' ),
			} );
			expect( [ 'baba' ] ).toEqual( context.onCalls );
			expect( [] ).toEqual( context.offCalls );
		} );
	} );
} );

function mockContext() {
	var propNames = Array.prototype.slice.call( arguments ),
		context = {
			onCalls: [],
			offCalls: [],
			props: {},
			update: 'callback',
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
			expect( 'change' ).toEqual( event );
			expect( 'callback' ).toEqual( callback );
		},
		off: function( event, callback ) {
			context.offCalls.push( name );
			expect( 'change' ).toEqual( event );
			expect( 'callback' ).toEqual( callback );
		},
	};
}

function assertMixin( mixin ) {
	expect( typeof mixin.componentDidMount ).toBe( 'function' );
	expect( typeof mixin.componentWillUnmount ).toBe( 'function' );
	expect( typeof mixin.componentWillReceiveProps ).toBe( 'function' );
}
