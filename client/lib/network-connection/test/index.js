/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import config from 'config';
import NetworkConnectionApp from 'lib/network-connection';

describe( 'index', function() {
	beforeEach( function() {
		this.configStub = sinon.stub( config, 'isEnabled' ).returns( true );
	} );

	afterEach( function() {
		this.configStub.restore();
	} );

	it( 'has to be enabled when config flag is enabled', function() {
		expect( NetworkConnectionApp.isEnabled() ).to.be.true;
	} );

	it( 'has initial state connected', function() {
		expect( NetworkConnectionApp.isConnected() ).to.be.true;
	} );

	describe( 'Events', function() {
		beforeEach( function() {
			this.changeSpy = sinon.spy();
			NetworkConnectionApp.on( 'change', this.changeSpy );
		} );

		afterEach( function() {
			NetworkConnectionApp.off( 'change', this.changeSpy );
		} );

		it( 'has to persist connected state when connected event sent', function() {
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.true;
			expect( this.changeSpy ).to.have.been.neverCalled;
		} );

		it( 'has to change state to disconnected when disconnected event sent', function() {
			NetworkConnectionApp.emitDisconnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.false;
			expect( this.changeSpy ).to.have.been.calledOnce;
		} );

		it( 'has to change state to connected only once when connected event sent twice', function() {
			NetworkConnectionApp.emitConnected();
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.true;
			expect( this.changeSpy ).to.have.been.calledOnce;
		} );

		it( 'has to change state to disconnected and then back to connected when disconnected and then connected events sent', function() {
			NetworkConnectionApp.emitDisconnected();
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.true;
			expect( this.changeSpy ).to.have.been.calledTwice;
		} );
	} );
} );
