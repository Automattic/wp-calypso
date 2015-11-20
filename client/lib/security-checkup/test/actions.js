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
	analytics = require( 'analytics' ),
	testConstants = require( './constants' ),
	actions = require( '../constants' ).actions,
	undocumentedMe = require( 'lib/wpcom-undocumented/lib/me' ),
	SecurityCheckupActions = require( '../actions' );

const sandbox = sinon.sandbox.create();

describe( 'SecurityCheckupActions', function() {
	beforeEach( function() {
		sandbox.stub( Dispatcher, 'handleServerAction' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		sandbox.stub( analytics.tracks, 'recordEvent' );
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	describe( 'dismissPhoneNotice()', function() {
		it( 'should dispatch a ViewAction', function() {
			SecurityCheckupActions.dismissPhoneNotice();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DISMISS_ACCOUNT_RECOVERY_PHONE_NOTICE
			} );
		} );
	} );

	describe( 'dismissEmailNotice()', function() {
		it( 'should dispatch a ViewAction', function() {
			SecurityCheckupActions.dismissEmailNotice();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE
			} );
		} );
	} );

	describe( 'updateEmail()', function() {
		beforeEach( function() {
			sandbox.stub( undocumentedMe.prototype, 'updateAccountRecoveryEmail' )
				.callsArgWithAsync( 1, null, testConstants.DUMMY_UPDATE_EMAIL_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', function() {
			SecurityCheckupActions.updateEmail( testConstants.DUMMY_EMAIL );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.UPDATE_ACCOUNT_RECOVERY_EMAIL,
				email: testConstants.DUMMY_EMAIL
			} );
		} );

		it( 'should call the WP.com REST API', function() {
			SecurityCheckupActions.updateEmail( testConstants.DUMMY_EMAIL );

			expect( undocumentedMe.prototype.updateAccountRecoveryEmail ).to.have.been.calledWith( testConstants.DUMMY_EMAIL );
		} );

		it( 'should dispatch a ServerAction', function( done ) {
			SecurityCheckupActions.updateEmail( testConstants.DUMMY_EMAIL );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_EMAIL,
					email: testConstants.DUMMY_EMAIL,
					data: testConstants.DUMMY_UPDATE_EMAIL_RESPONSE,
					error: null
				} );

				done();
			} );
		} );
	} );

	describe( 'deleteEmail()', function() {
		beforeEach( function() {
			sandbox.stub( undocumentedMe.prototype, 'deleteAccountRecoveryEmail' )
				.callsArgWithAsync( 0, null, testConstants.DUMMY_DELETE_EMAIL_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', function() {
			SecurityCheckupActions.deleteEmail();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DELETE_ACCOUNT_RECOVERY_EMAIL
			} );
		} );

		it( 'should call the WP.com REST API', function() {
			SecurityCheckupActions.deleteEmail();

			expect( undocumentedMe.prototype.deleteAccountRecoveryEmail ).to.have.been.called;
		} );

		it( 'should dispatch a ServerAction', function( done ) {
			SecurityCheckupActions.deleteEmail();

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL,
					data: testConstants.DUMMY_DELETE_EMAIL_RESPONSE,
					error: null
				} );

				done();
			} );
		} );
	} );

	describe( 'updatePhone()', function() {
		beforeEach( function() {
			sandbox.stub( undocumentedMe.prototype, 'updateAccountRecoveryPhone' )
				.callsArgWithAsync( 2, null, testConstants.DUMMY_UPDATE_PHONE_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', function() {
			SecurityCheckupActions.updatePhone( testConstants.DUMMY_PHONE );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.UPDATE_ACCOUNT_RECOVERY_PHONE,
				phone: testConstants.DUMMY_PHONE
			} );
		} );

		it( 'should call the WP.com REST API', function() {
			SecurityCheckupActions.updatePhone( testConstants.DUMMY_PHONE );

			expect( undocumentedMe.prototype.updateAccountRecoveryPhone ).to.have.been.calledWith(
				testConstants.DUMMY_PHONE_COUNTRY,
				testConstants.DUMMY_PHONE_NUMBER
			);
		} );

		it( 'should dispatch a ServerAction', function( done ) {
			SecurityCheckupActions.updatePhone( testConstants.DUMMY_PHONE );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: actions.RECEIVE_UPDATED_ACCOUNT_RECOVERY_PHONE,
					phone: testConstants.DUMMY_PHONE,
					data: testConstants.DUMMY_UPDATE_PHONE_RESPONSE,
					error: null
				} );

				done();
			} );
		} );
	} );

	describe( 'deletePhone()', function() {
		beforeEach( function() {
			sandbox.stub( undocumentedMe.prototype, 'deleteAccountRecoveryPhone' )
				.callsArgWithAsync( 0, null, testConstants.DUMMY_DELETE_PHONE_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', function() {
			SecurityCheckupActions.deletePhone();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DELETE_ACCOUNT_RECOVERY_PHONE
			} );
		} );

		it( 'should call the WP.com REST API', function() {
			SecurityCheckupActions.deletePhone();

			expect( undocumentedMe.prototype.deleteAccountRecoveryPhone ).to.have.been.called;
		} );

		it( 'should dispatch a ServerAction', function( done ) {
			SecurityCheckupActions.deletePhone();

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_PHONE,
					data: testConstants.DUMMY_DELETE_PHONE_RESPONSE,
					error: null
				} );

				done();
			} );
		} );
	} );
} );
