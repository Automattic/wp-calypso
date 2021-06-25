/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import NetworkConnectionApp from 'calypso/lib/network-connection';

describe( 'index', () => {
	let configStub;

	beforeEach( () => {
		configStub = sinon.stub( config, 'isEnabled' ).returns( true );
	} );

	afterEach( () => {
		configStub.restore();
	} );

	test( 'has to be enabled when config flag is enabled', () => {
		expect( NetworkConnectionApp.isEnabled() ).to.be.true;
	} );

	test( 'has initial state connected', () => {
		expect( NetworkConnectionApp.isConnected() ).to.be.true;
	} );

	describe( 'Events', () => {
		let changeSpy;

		beforeEach( () => {
			changeSpy = sinon.spy();
			NetworkConnectionApp.on( 'change', changeSpy );
		} );

		afterEach( () => {
			NetworkConnectionApp.off( 'change', changeSpy );
		} );

		test( 'has to persist connected state when connected event sent', () => {
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.true;
			expect( changeSpy ).to.have.not.been.called;
		} );

		test( 'has to change state to disconnected when disconnected event sent', () => {
			NetworkConnectionApp.emitDisconnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.false;
			expect( changeSpy ).to.have.been.calledOnce;
		} );

		test( 'has to change state to connected only once when connected event sent twice', () => {
			NetworkConnectionApp.emitConnected();
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.true;
			expect( changeSpy ).to.have.been.calledOnce;
		} );

		test( 'has to change state to disconnected and then back to connected when disconnected and then connected events sent', () => {
			NetworkConnectionApp.emitDisconnected();
			NetworkConnectionApp.emitConnected();

			expect( NetworkConnectionApp.isConnected() ).to.be.true;
			expect( changeSpy ).to.have.been.calledTwice;
		} );
	} );
} );
