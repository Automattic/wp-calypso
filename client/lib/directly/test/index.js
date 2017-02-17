/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

// const initializeSpy = sinon.spy( require( '../vendor' ) );

 /**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
// const initializeDirectly = require( '../vendor' );
import directly from '..';

describe( 'index', () => {
	let vendor;
	useFakeDom();

	beforeEach( () => {
		vendor = require( '../vendor' );
		sinon.spy( vendor, 'initializeDirectly' );
	} );

	afterEach( () => {
		// After each test, clean up the globals put in place by Directly
		delete window.DirectlyRTM;
		delete require.cache[ require.resolve( '../vendor' ) ];
	} );

	describe( 'initialize', () => {
		it( 'uses the given config data for Directly', () => {
			const config = { a: '1', b: '2', c: '3' };
			directly.initialize( config );
			//
			// expect( window.DirectlyRTM.cq ).to.have.lengthOf( 1 );
			// expect( window.DirectlyRTM.cq[ 0 ][ 0 ] ).to.equal( 'config' );
			// expect( window.DirectlyRTM.cq[ 0 ][ 1 ] ).to.contain.all.keys( config );
			expect( vendor.initializeDirectly.callCount ).to.equal( 1 );
			expect( vendor.initializeDirectly.firstCall.args[ 0 ] ).to.contain.all.keys( config );
		} );
	} );

	describe( 'askQuestion', () => {
		const questionOptions = {
			questionText: 'How can I give you all my money?',
			name: 'Richie Rich',
			email: 'richie@richenterprises.biz',
		};

		it( 'does nothing if Directly hasn\'t been initialized', () => {
			expect( directly.askQuestion( questionOptions ) ).not.to.throw;
			expect( window.DirectlyRTM ).to.be.undefined;
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
			expect( directly.maximize() ).not.to.throw;
			expect( window.DirectlyRTM ).to.be.undefined;
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
			expect( directly.minimize() ).not.to.throw;
			expect( window.DirectlyRTM ).to.be.undefined;
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
			expect( directly.openAskForm() ).not.to.throw;
			expect( window.DirectlyRTM ).to.be.undefined;
		} );

		it( 'invokes the Directly API with the given paramaters', () => {
			window.DirectlyRTM = sinon.spy();
			directly.initialize();
			directly.openAskForm();
			expect( window.DirectlyRTM ).to.have.been.calledWith( 'openAskForm' );
		} );
	} );
} );
