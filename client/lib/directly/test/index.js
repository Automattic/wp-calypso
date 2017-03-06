/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

 /**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
// import * as loadScript from 'lib/load-script';

let directly;
let loadScript;

describe( 'index', () => {
	// Need to use `require` to correctly spy on loadScript
	loadScript = require( 'lib/load-script' );
	sinon.spy( loadScript, 'loadScript' );

	useFakeDom();

	beforeEach( () => {
		directly = require( '..' );
	} );

	afterEach( () => {
		loadScript.loadScript.reset();

		// After each test, clean up the globals put in place by Directly
		const script = document.querySelector( '#directlyRTMScript' );
		if ( script ) {
			script.remove();
		}
		delete window.DirectlyRTM;
		delete require.cache[ require.resolve( '..' ) ];
	} );

	describe( '#initialize()', () => {
		it( 'creates a window.DirectlyRTM function', () => {
			directly.initialize();
			expect( typeof window.DirectlyRTM ).to.equal( 'function' );
		} );

		it( 'attempts to load the remote script', () => {
			directly.initialize();
			expect( loadScript.loadScript ).to.have.been.calledOnce;
		} );

		it( 'does nothing after the first call', () => {
			directly.initialize();
			directly.initialize();
			directly.initialize();

			expect( window.DirectlyRTM.cq ).to.have.lengthOf( 1 );
			expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).to.equal( 'config' );
			expect( loadScript.loadScript ).to.have.been.calledOnce;
		} );

		it( 'resolves the returned promise if the library load succeeds', ( done ) => {
			directly.initialize().then( () => done() );
			loadScript.loadScript.firstCall.args[ 1 ]();
		} );

		it( 'rejects the returned promise if the library load fails', ( done ) => {
			const error = { oh: 'no' };
			directly.initialize().then(
				() => {},
				( e ) => {
					expect( e ).to.equal( error );
					done();
				}
			);
			loadScript.loadScript.firstCall.args[ 1 ]( error );
		} );
	} );

	describe( '#askQuestion()', () => {
		const questionText = 'How can I give you all my money?';
		const name = 'Richie Rich';
		const email = 'richie@richenterprises.biz';

		it( 'initializes Directly if it hasn\'t already been initialized', () => {
			directly.askQuestion( questionText, name, email );
			expect( typeof window.DirectlyRTM ).to.equal( 'function' );
			expect( loadScript.loadScript ).to.have.been.calledOnce;
		} );

		it( 'invokes the Directly API with the given paramaters', ( done ) => {
			window.DirectlyRTM = sinon.spy();
			directly.askQuestion( questionText, name, email ).then( () => {
				expect( window.DirectlyRTM ).to.have.been.calledWith( 'askQuestion', { questionText, name, email } );
				done();
			} );

			// Fake the script loading to resolve the initialize() promise chain
			loadScript.loadScript.firstCall.args[ 1 ]();
		} );
	} );
} );
