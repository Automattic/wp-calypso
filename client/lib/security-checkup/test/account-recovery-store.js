/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';

import Dispatcher from 'dispatcher';
import undocumentedMe from 'lib/wpcom-undocumented/lib/me';

describe( 'AccountRecoveryStore', () => {
	let AccountRecoveryStore, sandbox, dispatchHandler, testConstants;

	useSandbox( sandy => sandbox = sandy );

	beforeEach( () => {
		testConstants = require( './fixtures/constants' );
		sandbox.spy( Dispatcher, 'register' );
		sandbox.stub( undocumentedMe.prototype, 'getAccountRecovery' )
			.callsArgWithAsync( 0, null, testConstants.DUMMY_ACCOUNT_RECOVERY_RESPONSE );
		delete require.cache[ require.resolve( '../account-recovery-store' ) ];
		AccountRecoveryStore = require( '../account-recovery-store' );
		dispatchHandler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'getEmail()', () => {
		it( 'should call the WP.com REST API on first request', () => {
			const data = AccountRecoveryStore.getEmail();
			expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;
			expect( data ).to.eql( testConstants.DUMMY_STORE_EMAIL_OBJECT_LOADING );
		} );

		it( 'should only call the WP.com REST API only once', done => {
			AccountRecoveryStore.getEmail();
			process.nextTick( () => {
				AccountRecoveryStore.getEmail();

				process.nextTick( () => {
					expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;
					done();
				} );
			} );
		} );

		it( 'should return remote data', done => {
			AccountRecoveryStore.getEmail();

			process.nextTick( () => {
				const data = AccountRecoveryStore.getEmail();
				expect( data ).to.eql( testConstants.DUMMY_STORE_EMAIL_OBJECT );
				done();
			} );
		} );
	} );

	describe( 'getPhone()', () => {
		it( 'should call the WP.com REST API on first request', () => {
			const data = AccountRecoveryStore.getPhone();

			expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;
			expect( data ).to.eql( testConstants.DUMMY_STORE_PHONE_OBJECT_LOADING );
		} );

		it( 'should only call the WP.com REST API only once', done => {
			AccountRecoveryStore.getPhone();
			process.nextTick( () => {
				AccountRecoveryStore.getPhone();

				process.nextTick( () => {
					expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;
					done();
				} );
			} );
		} );

		it( 'should return remote data', done => {
			AccountRecoveryStore.getPhone();

			process.nextTick( () => {
				var data = AccountRecoveryStore.getPhone();
				expect( data ).to.eql( testConstants.DUMMY_STORE_PHONE_OBJECT );
				done();
			} );
		} );
	} );

	describe( '.dispatchToken', () => {
		let dispatch;
		before( () => {
			dispatch = action => dispatchHandler( { action } );
		} );

		it( 'should expose dispatch ID', () => {
			expect( AccountRecoveryStore.dispatchToken ).to.be.a( 'string' );
		} );

		it( 'should update email on UPDATE_ACCOUNT_RECOVERY_EMAIL', () => {
			dispatch( testConstants.DISPATCH_UPDATE_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', testConstants.DUMMY_EMAIL );
		} );

		it( 'should update and set notice on RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL', () => {
			dispatch( testConstants.DISPATCH_RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', testConstants.DUMMY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.property( 'lastNotice' ).that.is.an( 'object' );
		} );

		it( 'should delete on DELETE_ACCOUNT_RECOVERY_EMAIL', () => {
			dispatch( testConstants.DISPATCH_DELETE_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', null );
		} );

		it( 'should delete and update notice on RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL', () => {
			dispatch( testConstants.DISPATCH_RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', null );
			expect( AccountRecoveryStore.getEmail() ).to.have.property( 'lastNotice' ).that.is.an( 'object' );
		} );

		it( 'should dismiss notice on DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE', () => {
			dispatch( testConstants.DISPATCH_RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL );
			dispatch( testConstants.DISPATCH_DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE );
			expect( AccountRecoveryStore.getEmail() ).to.have.property( 'lastNotice' ).that.is.false;
		} );
	} );
} );
