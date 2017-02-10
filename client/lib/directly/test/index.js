/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

 /**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

const DIRECTLY_SCRIPT_SELECTOR = 'script#directlyRTMScript';

describe( 'index', () => {
	let directly;
	useFakeDom();

	beforeEach( () => {
		directly = require( '..' );
	} );

	afterEach( () => {
		// After each test, clean up the globals put in place by Directly and delete the
		// cached module so its internal variables are reset
		const script = document.querySelector( DIRECTLY_SCRIPT_SELECTOR );
		if ( script ) {
			script.remove();
		}
		delete window.DirectlyRTM;
		delete require.cache[ require.resolve( '..' ) ];
	} );

	describe( 'initialize', () => {
		it( 'adds a <script> with correct ID', () => {
			// Directly requires the script to have a certain ID for the library to work
			directly.initialize();
			const script = document.querySelector( DIRECTLY_SCRIPT_SELECTOR );
			expect( script ).not.to.be.null;
		} );

		it( 'uses the given config data for Directly', () => {
			const config = { a: '1', b: '2', c: '3' };
			directly.initialize( config );

			expect( window.DirectlyRTM.cq ).to.have.lengthOf( 1 );
			expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).to.equal( 'config' );
			expect( window.DirectlyRTM.cq[ 0 ][ 1 ] ).to.contain.all.keys( config );
		} );

		it( 'invokes the callback on successful script load', () => {
			const spy = sinon.spy();

			directly.initialize( {}, spy );
			document.querySelector( DIRECTLY_SCRIPT_SELECTOR ).onload( {} );

			expect( spy ).to.have.been.calledWith( null );
		} );

		it( 'invokes the callback with non-null error argument on failed script load', () => {
			const spy = sinon.spy();
			const errorEvent = {
				type: 'error',
				target: {
					src: ''
				}
			};

			directly.initialize( {}, spy );
			document.querySelector( DIRECTLY_SCRIPT_SELECTOR ).onerror( errorEvent );

			expect( spy ).to.have.been.called.once;
			expect( spy.firstCall.args[ 0 ] ).not.to.be.null;
		} );

		it( 'does nothing after the first call', () => {
			window.DirectlyRTM = sinon.spy();
			const config1 = { a: 'e', b: 'e', c: 'e' };
			const config2 = { m: '4', n: '5', o: '6' };
			const config3 = { x: '7', y: '8', z: '9' };

			directly.initialize( config1 );
			directly.initialize( config2 );
			directly.initialize( config3 );

			expect( window.DirectlyRTM ).to.have.been.called.once;
			expect( window.DirectlyRTM.firstCall.args[ 0 ] ).to.equal( 'config' );
			Object.keys( config1 ).forEach( ( key ) => {
				expect( window.DirectlyRTM.firstCall.args[ 1 ][ key ] ).to.equal( config1[ key ] );
			} );
			expect( document.querySelectorAll( DIRECTLY_SCRIPT_SELECTOR ) ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'askQuestion', () => {
		const questionOptions = {
			questionText: 'How can I give you all my money?',
			name: 'Richie Rich',
			email: 'richie@richenterprises.biz',
		};

		it( 'does nothing if Directly hasn\'t been initialized', () => {
			window.DirectlyRTM = sinon.spy();
			directly.askQuestion( questionOptions );
			expect( window.DirectlyRTM ).not.to.have.been.called;
		} );

		it( 'invokes the Directly API with the given paramaters', () => {
			window.DirectlyRTM = sinon.spy();
			directly.initialize();
			directly.askQuestion( questionOptions );
			expect( window.DirectlyRTM ).to.have.been.calledWith( 'askQuestion', questionOptions );
		} );
	} );

	describe( 'maximize', () => {
		it( 'does nothing if Directly hasn\'t been initialized', () => {
			window.DirectlyRTM = sinon.spy();
			directly.maximize();
			expect( window.DirectlyRTM ).not.to.have.been.called;
		} );

		it( 'invokes the Directly API with the given paramaters', () => {
			window.DirectlyRTM = sinon.spy();
			directly.initialize();
			directly.maximize();
			expect( window.DirectlyRTM ).to.have.been.calledWith( 'maximize' );
		} );
	} );

	describe( 'minimize', () => {
		it( 'does nothing if Directly hasn\'t been initialized', () => {
			window.DirectlyRTM = sinon.spy();
			directly.minimize();
			expect( window.DirectlyRTM ).not.to.have.been.called;
		} );

		it( 'invokes the Directly API with the given paramaters', () => {
			window.DirectlyRTM = sinon.spy();
			directly.initialize();
			directly.minimize();
			expect( window.DirectlyRTM ).to.have.been.calledWith( 'minimize' );
		} );
	} );

	describe( 'openAskForm', () => {
		it( 'does nothing if Directly hasn\'t been initialized', () => {
			window.DirectlyRTM = sinon.spy();
			directly.openAskForm();
			expect( window.DirectlyRTM ).not.to.have.been.called;
		} );

		it( 'invokes the Directly API with the given paramaters', () => {
			window.DirectlyRTM = sinon.spy();
			directly.initialize();
			directly.openAskForm();
			expect( window.DirectlyRTM ).to.have.been.calledWith( 'openAskForm' );
		} );
	} );
} );
