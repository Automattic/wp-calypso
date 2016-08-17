/**
 * External Dependencies
 */
import partial from 'lodash/partial';
import assert from 'assert';
import isFunction from 'lodash/isFunction';

/**
 * Internal Dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';


describe( 'wrapping', () => {
	let sandbox,
		arrayProps = [ 'keys', 'entries', 'values', 'findIndex', 'fill', 'find' ].filter( key => isFunction( Array.prototype[ key ] ) ),
		stringProps = [ 'codePointAt', 'normalize', 'repeat', 'startsWith', 'endsWith', 'includes' ].filter( key => isFunction( String.prototype[ key ] ) ),
		consoleSpy,
		regExpProps = [ 'flags' ].filter( key => isFunction( RegExp.prototype[ key ] ) );

	function installSpies( props, obj ) {
		props.forEach( key => {
			sandbox.spy( obj, key );
		} );
	}

	function assertCall( obj, args, key ) {
		it( key, () => {
			if ( isFunction( obj[ key ] ) ) {
				obj[ key ].apply( obj, args );
				assert( consoleSpy.calledOnce );
			}
		} )
	}

	useSandbox( newSandbox => sandbox = newSandbox );
	before( () => {
		consoleSpy = sandbox.stub( console, 'error' );
		installSpies( arrayProps, Array.prototype );
		installSpies( stringProps, String.prototype );
		installSpies( regExpProps, RegExp.prototype );

		require( '../' )();
	} );

	after( () => {
		sandbox.restore();
	} );

	beforeEach( () => {
		consoleSpy.reset();
	} );

	describe( 'Array', () => {
		[ 'keys', 'entries', 'values' ].forEach( partial( assertCall, Array.prototype, [] ) );
		[ 'findIndex', 'find' ].forEach( partial( assertCall, Array.prototype, [ () => true ] ) );
		[ 'fill' ].forEach( partial( assertCall, Array.prototype, [ 1 ] ) );
	} );

	describe( 'String', () => {
		[ 'codePointAt', 'repeat' ].forEach( partial( assertCall, 'hello', [ 1 ] ) );
		[ 'startsWith', 'endsWith', 'includes' ].forEach( partial( assertCall, 'hello', [ 'a' ] ) );
		[ 'normalize' ].forEach( partial( assertCall, 'hello', [] ) );
	} );

	describe( 'RegExp', () => {
		[ 'flags' ].forEach( partial( assertCall, /a/, 'flags', [ 'g' ] ) );
	} );

} );
