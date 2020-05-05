/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';

let directly;
let loadScript;

describe( 'index', () => {
	// Helpers to simulate whether the remote Directly script loads or fails
	const simulateSuccessfulScriptLoad = () => loadScript.loadScript.callsArg( 1 );
	const simulateFailedScriptLoad = ( error ) => loadScript.loadScript.callsArgWith( 1, error );

	beforeEach( () => {
		loadScript = require( '@automattic/load-script' );
		sinon.stub( loadScript, 'loadScript' );
		directly = require( '..' );

		// Since most tests expect the script to load, make this the default
		simulateSuccessfulScriptLoad();
	} );

	afterEach( () => {
		// After each test, clean up the globals put in place by Directly
		const script = document.querySelector( '#directlyRTMScript' );
		if ( script ) {
			script.remove();
		}
		window.DirectlyRTM = undefined;
		// We need to reset local state in directly library
		jest.resetModules();
	} );

	describe( 'when the API says Directly is available', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/help/directly/mine' )
				.reply( 200, {
					isAvailable: true,
				} );
		} );

		describe( '#initialize()', () => {
			test( 'creates a window.DirectlyRTM function', () => {
				return directly
					.initialize()
					.then( () => expect( typeof window.DirectlyRTM ).to.equal( 'function' ) );
			} );

			test( 'attempts to load the remote script', () => {
				return directly
					.initialize()
					.then( () => expect( loadScript.loadScript ).to.have.been.calledOnce );
			} );

			test( 'does nothing after the first call', ( done ) => {
				Promise.all( [ directly.initialize(), directly.initialize(), directly.initialize() ] )
					.then( () => {
						expect( window.DirectlyRTM.cq ).to.have.lengthOf( 1 );
						expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).to.equal( 'config' );
						expect( loadScript.loadScript ).to.have.been.calledOnce;
					} )
					.then( () => done() );
			} );

			test( 'resolves the returned promise if the library load succeeds', ( done ) => {
				directly.initialize().then( () => done() );
			} );

			test( 'rejects the returned promise if the library load fails', ( done ) => {
				const error = { src: 'http://url.to/directly/embed.js' };
				simulateFailedScriptLoad( error );

				directly
					.initialize()
					.catch( ( e ) => {
						expect( e ).to.be.an.instanceof( Error );
						expect( e.message ).to.contain( error.src );
					} )
					.then( () => done() );
			} );
		} );

		describe( '#askQuestion()', () => {
			const questionText = 'How can I give you all my money?';
			const name = 'Richie Rich';
			const email = 'richie@richenterprises.biz';

			test( "initializes Directly if it hasn't already been initialized", ( done ) => {
				directly
					.askQuestion( questionText, name, email )
					.then( () => {
						expect( typeof window.DirectlyRTM ).to.equal( 'function' );
						expect( loadScript.loadScript ).to.have.been.calledOnce;
					} )
					.then( () => done() );
			} );

			test( 'invokes the Directly API with the given paramaters', ( done ) => {
				window.DirectlyRTM = sinon.spy();
				directly
					.askQuestion( questionText, name, email )
					.then( () =>
						expect( window.DirectlyRTM ).to.have.been.calledWith( 'askQuestion', {
							questionText,
							name,
							email,
						} )
					)
					.then( () => done() );
			} );
		} );
	} );

	describe( 'when the public API says Directly is not available', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/help/directly/mine' )
				.reply( 200, {
					isAvailable: false,
				} );
		} );

		describe( '#initialize()', () => {
			test( 'rejects intialization with an error', ( done ) => {
				directly
					.initialize()
					.catch( ( e ) => {
						expect( e ).to.be.an.instanceof( Error );
						expect( e.message ).to.equal(
							'Directly Real-Time Messaging is not available at this time.'
						);
					} )
					.then( () => done() );
			} );

			test( 'does not attempt to load the remote script', ( done ) => {
				directly
					.initialize()
					.catch( () => {
						expect( loadScript.loadScript ).not.to.have.been.called;
					} )
					.then( () => done() );
			} );
		} );
	} );
} );
