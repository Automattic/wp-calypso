/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import {
	exposeInternalMethodsForTesting,
	isLoading,
	JQUERY_URL,
	loadjQueryDependentScript,
	loadScript,
	removeAllScriptCallbacks,
	removeScriptCallback,
	removeScriptCallbacks,
} from '../';

const {
	_addScriptCallback,
	_attachToHead,
	_createScriptElement,
	_executeCallbacks,
	_getCallbacks,
	_handleRequestError,
	_handleRequestSuccess,
} = exposeInternalMethodsForTesting();

describe( 'loadScript', function() {
	useFakeDom();

	describe( '_getCallbacks()', function() {
		it( 'should initially return an empty object', function() {
			expect( _getCallbacks() ).to.be.an( 'object' ).that.is.empty;
		} );
	} );

	describe( '_addScriptCallback( url, callback )', function() {
		// NOTE: This test is tightly coupled with removeAllScriptCallbacks tests

		before( function() {
			removeAllScriptCallbacks();
		} );

		afterEach( function() {
			removeAllScriptCallbacks();
		} );

		it( 'should create a new array for a callback function to a new URL', function() {
			const callbacks = _getCallbacks();

			const url = '/';
			const callback = () => {};
			_addScriptCallback( url, callback );

			expect( callbacks[ url ] ).to.eql( [ callback ] );
		} );

		it( 'should append to an existing array for a callback function to an old URL', function() {
			const callbacks = _getCallbacks();

			const url = '/';
			const callback1 = () => {};
			const callback2 = () => {};

			_addScriptCallback( url, callback1 );
			expect( callbacks[ url ] ).to.eql( [ callback1 ] );

			_addScriptCallback( url, callback2 );
			expect( callbacks[ url ] ).to.eql( [ callback1, callback2 ] );
		} );
	} );

	describe( 'removeAllScriptCallbacks()', function() {
		// NOTE: This test is tightly coupled with _addScriptCallback tests

		it( 'should reset callbacks object to empty', function() {
			const callbacks = _getCallbacks();

			const url = '/';
			const callback = () => {};
			_addScriptCallback( url, callback );

			expect( callbacks ).to.eql( { [ url ]: [ callback ] } );

			removeAllScriptCallbacks();

			expect( callbacks ).to.eql( {} );
		} );
	} );

	describe( 'isLoading( url )', function() {
		before( function() {
			removeAllScriptCallbacks();
		} );

		afterEach( function() {
			removeAllScriptCallbacks();
		} );

		it( 'should be false if the URL is new/unrecognized', function() {
			const url = '/';
			expect( isLoading( url ) ).to.be.false;
		} );

		it( 'should be true if the URL is old/recognized', function() {
			const url = '/';
			const callback = () => {};
			_addScriptCallback( url, callback );
			expect( isLoading( url ) ).to.be.true;
		} );
	} );

	describe( 'removeScriptCallback( url, callback )', function() {
		before( function() {
			removeAllScriptCallbacks();
		} );

		afterEach( function() {
			removeAllScriptCallbacks();
		} );

		it( 'should remove the callback from the second parameter', function() {
			const callbacks = _getCallbacks();
			const url = '/';
			const callback1 = () => {};
			const callback2 = () => {};
			const callback3 = () => {};

			_addScriptCallback( url, callback1 );
			_addScriptCallback( url, callback2 );
			_addScriptCallback( url, callback3 );
			expect( callbacks ).to.eql( { [ url ]: [ callback1, callback2, callback3 ] } );

			removeScriptCallback( url, callback2 );
			expect( callbacks ).to.eql( { [ url ]: [ callback1, callback3 ] } );
		} );
	} );

	describe( 'removeScriptCallbacks( url )', function() {
		// NOTE: This test is tightly coupled with _addScriptCallback tests
		before( function() {
			removeAllScriptCallbacks();
		} );
		afterEach( function() {
			removeAllScriptCallbacks();
		} );

		it( 'should remove all callbacks associated with the URL', function() {
			const callbacks = _getCallbacks();

			const url1 = '/';
			const url2 = '/information';
			const callback = () => {};
			_addScriptCallback( url1, callback );
			_addScriptCallback( url2, callback );

			expect( callbacks ).to.eql( { [ url1 ]: [ callback ], [ url2 ]: [ callback ] } );

			removeScriptCallbacks( url1 );

			expect( callbacks ).to.eql( { [ url2 ]: [ callback ] } );
		} );
	} );

	describe( '_executeCallbacks( url, callbackArguments )', function() {
		before( function() {
			removeAllScriptCallbacks();
		} );

		afterEach( function() {
			removeAllScriptCallbacks();
		} );

		it( 'should execute all callbacks associated with the URL', function() {
			const url1 = '/';
			const url2 = '/information';
			const callback1a = spy();
			const callback1b = spy();
			const callback2a = spy();
			const callback2b = spy();

			_addScriptCallback( url1, callback1a );
			_addScriptCallback( url1, callback1b );
			_addScriptCallback( url2, callback2a );
			_addScriptCallback( url2, callback2b );
			expect( callback1a ).to.have.not.been.called;
			expect( callback1b ).to.have.not.been.called;
			expect( callback2a ).to.have.not.been.called;
			expect( callback2b ).to.have.not.been.called;

			const params = { some: 'params' };
			_executeCallbacks( url1, params );
			expect( callback1a ).have.been.calledOnce;
			expect( callback1a ).have.been.calledWith( params );
			expect( callback1b ).to.have.been.called;
			expect( callback1b ).have.been.calledWith( params );
			expect( callback2a ).to.have.not.been.called;
			expect( callback2b ).to.have.not.been.called;
		} );
	} );

	describe( '_handleRequestSuccess( url )', function() {
		const someObject = {};
		const url = '/';
		const _executeCallbacksSpy = spy();

		before( function() {
			_handleRequestSuccess.bind( someObject )( url, _executeCallbacksSpy );
		} );

		it( 'should execute callbacks associated with the url', function() {
			expect( _executeCallbacksSpy ).to.have.been.calledOnce;
			expect( _executeCallbacksSpy ).to.have.been.calledWith( url );
		} );
		it( 'should set this.onload to null', function() {
			expect( someObject ).to.include( { onload: null } );
		} );
	} );

	describe( '_handleRequestError( url )', function() {
		const someObject = {};
		const url = '/';
		const _executeCallbacksSpy = spy();

		before( function() {
			_handleRequestError.bind( someObject )( url, _executeCallbacksSpy );
		} );

		it( 'should execute callbacks associated with the url with an error', function() {
			expect( _executeCallbacksSpy ).to.have.been.calledOnce;
			expect( _executeCallbacksSpy ).to.have.been.calledWith( url, new Error( `Failed to load script "${ url }"` ) );
		} );
		it( 'should set this.onerror to null', function() {
			expect( someObject ).to.include( { onerror: null } );
		} );
	} );

	describe( '_createScriptElement( url )', function() {
		let createElement;
		let script;
		const url = '/some-url-resource';
		const createElementSpy = spy();
		const _handleRequestSuccessSpy = spy();
		const _handleRequestErrorSpy = spy();

		before( function() {
			createElement = global.window.document.createElement;
			global.window.document.createElement = function( ...args ) {
				createElementSpy( ...args );
				return {};
			};
			script = _createScriptElement( url, _handleRequestSuccessSpy, _handleRequestErrorSpy );
		} );

		after( function() {
			global.window.document.createElement = createElement;
		} );

		it( 'should call document.createElement', function() {
			expect( createElementSpy ).to.have.been.calledOnce;
			expect( createElementSpy ).to.have.been.calledWith( 'script' );
		} );

		it( 'should have a src matching the url', function() {
			expect( script.src ).to.include( url );
		} );

		it( 'should be marked as a JavaScript script', function() {
			expect( script.type ).to.eql( 'text/javascript' );
		} );

		it( 'should be loaded asynchronously', function() {
			expect( script.async ).to.be.true;
		} );

		it( 'should have a defined onload function', function() {
			expect( script.onload ).to.be.a( 'function' );
			script.onload();
			expect( _handleRequestSuccessSpy ).to.have.been.calledOnce;
			expect( _handleRequestSuccessSpy ).to.have.been.calledWith( url );
		} );

		it( 'should have a defined onerror function', function() {
			expect( script.onerror ).to.be.a( 'function' );
			script.onerror();
			expect( _handleRequestErrorSpy ).to.have.been.calledOnce;
			expect( _handleRequestErrorSpy ).to.have.been.calledWith( url );
		} );
	} );

	describe( '_attachToHead( element )', function() {
		const element = { example: 'data' };
		const getElementsByTagNameSpy = spy();
		const appendChildSpy = spy();
		let getElementsByTagName;

		before( function() {
			getElementsByTagName = global.window.document.getElementsByTagName;
			global.window.document.getElementsByTagName = function( ...args ) {
				getElementsByTagNameSpy( ...args );
				return [ {
					appendChild: function( ...innerArgs ) {
						appendChildSpy( ...innerArgs );
						return {};
					}
				} ];
			};

			_attachToHead( element );
		} );

		after( function() {
			global.window.document.getElementsByTagName = getElementsByTagName;
		} );

		it( 'should look for the document head using document.getElementsByTagName( "head" )', function() {
			expect( getElementsByTagNameSpy ).to.have.been.calledWith( 'head' );
		} );

		it( 'should append the element to the head using document.appendChild( element )', function() {
			expect( appendChildSpy ).to.have.been.calledWith( element );
		} );
	} );

	describe( 'loadScript( url, callback, attachToHead, createScriptElement )', function() {
		const url = '/';
		const callbackSpy = spy();
		const attachToHeadSpy = spy();
		const createScriptElementSpy = spy();

		before( function() {
			removeAllScriptCallbacks();
			loadScript( url, callbackSpy, attachToHeadSpy, createScriptElementSpy );
		} );

		afterEach( function() {
			removeAllScriptCallbacks();
		} );

		it( 'should add the callback onto the pending callbacks object', function() {
			expect( _getCallbacks()[ url ] ).to.eql( [ callbackSpy ] );

			expect( createScriptElementSpy ).to.have.been.calledOnce;
			expect( attachToHeadSpy ).to.have.been.calledOnce;

			expect( createScriptElementSpy ).to.have.been.calledWith( url );
			expect( attachToHeadSpy ).to.have.been.calledWith( createScriptElementSpy( url ) );
		} );
	} );

	describe( 'loadjQueryDependentScript( scriptURL, callback )', function() {
		const url = '/';
		const config = { isEnabled: () => false };
		const desktopConfig = { isEnabled: ( input ) => input === 'desktop' };

		before( function() {
			removeAllScriptCallbacks();
		} );

		afterEach( function() {
			removeAllScriptCallbacks();
		} );

		it( 'should require jQuery on the desktop', function() {
			const callbackSpy = spy();
			const loadScriptSpy = spy();
			loadjQueryDependentScript( url, callbackSpy, desktopConfig, loadScriptSpy );

			expect( callbackSpy ).to.not.have.been.called;
			expect( loadScriptSpy ).to.have.been.calledOnce;
			expect( loadScriptSpy ).to.have.been.calledWith( url );

			_executeCallbacks( url );
			expect( callbackSpy ).to.not.have.been.calledOnce;
		} );

		it( 'should use window.jQuery if available', function() {
			window.jQuery = {};
			const callbackSpy = spy();
			const loadScriptSpy = spy();
			loadjQueryDependentScript( url, callbackSpy, config, loadScriptSpy );

			expect( callbackSpy ).to.not.have.been.called;
			expect( loadScriptSpy ).to.have.been.calledOnce;
			expect( loadScriptSpy ).to.have.been.calledWith( url );

			_executeCallbacks( url );
			expect( callbackSpy ).to.not.have.been.calledOnce;
			expect( callbackSpy ).to.not.have.been.calledWith( url );

			delete window.jQuery;
		} );

		it( 'should sequentially load the jQuery script and the script from the URL (in that order)', function() {
			const callbackSpy = spy();
			const loadScriptSpy = spy();
			loadjQueryDependentScript( url, callbackSpy, config, loadScriptSpy );

			expect( callbackSpy ).to.not.have.been.called;
			expect( loadScriptSpy ).to.have.been.calledOnce;
			expect( loadScriptSpy ).to.have.been.calledWith( JQUERY_URL );

			// Invoke the callback function that loads the second loadScript call
			loadScriptSpy.lastCall.args[ 1 ]();
			expect( loadScriptSpy ).to.have.been.calledTwice;
			expect( loadScriptSpy ).to.have.been.calledWith( url );

			_executeCallbacks( url );
			expect( callbackSpy ).to.not.have.been.calledOnce;
			expect( callbackSpy ).to.not.have.been.calledWith( url );
		} );
	} );
} );
