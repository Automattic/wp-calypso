require( 'lib/react-test-env-setup' )();
require( 'lib/mixins/i18n' ).initialize();

/**
 * External dependencies
 */
const chai = require( 'chai' ),
	expect = chai.expect,
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' );

chai.use( sinonChai );

/**
 * Internal dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	testConstants = require( './constants' ),
	undocumentedMe = require( 'lib/wpcom-undocumented/lib/me' );

describe( 'AccountRecoveryStore', function() {
	var AccountRecoveryStore, sandbox, dispatchHandler;

	function dispatch( action ) {
		dispatchHandler( {
			action: action
		} );
	}

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
		sandbox.spy( Dispatcher, 'register' );
		sandbox.stub( undocumentedMe.prototype, 'getAccountRecovery' )
			.callsArgWithAsync( 0, null, testConstants.DUMMY_ACCOUNT_RECOVERY_RESPONSE );

		delete require.cache[ require.resolve( '../account-recovery-store' ) ];
		AccountRecoveryStore = require( '../account-recovery-store' );
		dispatchHandler = Dispatcher.register.lastCall.args[ 0 ];
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( 'getEmail()', function() {
		it( 'should call the WP.com REST API on first request', function() {
			var data = AccountRecoveryStore.getEmail();
			expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;

			expect( data ).to.eql( testConstants.DUMMY_STORE_EMAIL_OBJECT_LOADING );
		} );

		it( 'should only call the WP.com REST API only once', function( done ) {
			AccountRecoveryStore.getEmail();
			process.nextTick( function() {
				AccountRecoveryStore.getEmail();

				process.nextTick( function() {
					expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;

					done();
				} );
			} );
		} );

		it( 'should return remote data', function( done ) {
			AccountRecoveryStore.getEmail();

			process.nextTick( function() {
				var data = AccountRecoveryStore.getEmail();
				expect( data ).to.eql( testConstants.DUMMY_STORE_EMAIL_OBJECT );
				done();
			} );
		} );
	} );

	describe( 'getPhone()', function() {
		it( 'should call the WP.com REST API on first request', function() {
			var data = AccountRecoveryStore.getPhone();

			expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;

			expect( data ).to.eql( testConstants.DUMMY_STORE_PHONE_OBJECT_LOADING );
		} );

		it( 'should only call the WP.com REST API only once', function( done ) {
			AccountRecoveryStore.getPhone();
			process.nextTick( function() {
				AccountRecoveryStore.getPhone();

				process.nextTick( function() {
					expect( undocumentedMe.prototype.getAccountRecovery ).to.have.been.calledOnce;
					done();
				} );
			} );
		} );

		it( 'should return remote data', function( done ) {
			AccountRecoveryStore.getPhone();

			process.nextTick( function() {
				var data = AccountRecoveryStore.getPhone();
				expect( data ).to.eql( testConstants.DUMMY_STORE_PHONE_OBJECT );
				done();
			} );
		} );
	} );

	describe( '.dispatchToken', function() {
		it( 'should expose dispatch ID', function() {
			expect( AccountRecoveryStore.dispatchToken ).to.be.a( 'string' );
		} );

		it( 'should update email on UPDATE_ACCOUNT_RECOVERY_EMAIL', function() {
			dispatch( testConstants.DISPATCH_UPDATE_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', testConstants.DUMMY_EMAIL );
		} );

		it( 'should update and set notice on RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL', function() {
			dispatch( testConstants.DISPATCH_RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', testConstants.DUMMY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.property( 'lastNotice' ).that.is.an( 'object' );
		} );

		it( 'should delete on DELETE_ACCOUNT_RECOVERY_EMAIL', function() {
			dispatch( testConstants.DISPATCH_DELETE_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', null );
		} );

		it( 'should delete and update notice on RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL', function() {
			dispatch( testConstants.DISPATCH_RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL );
			expect( AccountRecoveryStore.getEmail() ).to.have.deep.property( 'data.email', null );
			expect( AccountRecoveryStore.getEmail() ).to.have.property( 'lastNotice' ).that.is.an( 'object' );
		} );

		it( 'should dismiss notice on DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE', function() {
			dispatch( testConstants.DISPATCH_RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL );
			dispatch( testConstants.DISPATCH_DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE );
			expect( AccountRecoveryStore.getEmail() ).to.have.property( 'lastNotice' ).that.is.false;
		} );
	} );
} );
