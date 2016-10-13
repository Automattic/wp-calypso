
/**
 * External dependencies
 */

import { expect } from 'chai';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */

import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'SecurityCheckupActions', () => {
	let Dispatcher, sandbox, actions, SecurityCheckupActions, testConstants, undocumentedMe;

	useSandbox( sandy => {
		sandbox = sandy;
	} );

	useFakeDom();
	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {
			tracks: {
				recordEvent: noop
			}
		} );
	} );

	before( () => {
		Dispatcher = require( 'dispatcher' );
		undocumentedMe = require( 'lib/wpcom-undocumented/lib/me' );
		actions = require( '../constants' ).actions;
		SecurityCheckupActions = require( '../actions' );
		testConstants = require( './fixtures/constants' );
	} );

	beforeEach( () => {
		sandbox.stub( Dispatcher, 'handleServerAction' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'dismissPhoneNotice()', () => {
		it( 'should dispatch a ViewAction', () => {
			SecurityCheckupActions.dismissPhoneNotice();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DISMISS_ACCOUNT_RECOVERY_PHONE_NOTICE
			} );
		} );
	} );

	describe( 'dismissEmailNotice()', () => {
		it( 'should dispatch a ViewAction', () => {
			SecurityCheckupActions.dismissEmailNotice();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DISMISS_ACCOUNT_RECOVERY_EMAIL_NOTICE
			} );
		} );
	} );

	describe( 'updateEmail()', () => {
		beforeEach( () => {
			sandbox.stub( undocumentedMe.prototype, 'updateAccountRecoveryEmail' )
				.callsArgWithAsync( 1, null, testConstants.DUMMY_UPDATE_EMAIL_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', () => {
			SecurityCheckupActions.updateEmail( testConstants.DUMMY_EMAIL );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.UPDATE_ACCOUNT_RECOVERY_EMAIL,
				email: testConstants.DUMMY_EMAIL
			} );
		} );

		it( 'should call the WP.com REST API', () => {
			SecurityCheckupActions.updateEmail( testConstants.DUMMY_EMAIL );

			expect( undocumentedMe.prototype.updateAccountRecoveryEmail ).to.have.been.calledWith( testConstants.DUMMY_EMAIL );
		} );

		it( 'should dispatch a ServerAction', done => {
			SecurityCheckupActions.updateEmail( testConstants.DUMMY_EMAIL );

			process.nextTick( () => {
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

	describe( 'deleteEmail()', () => {
		beforeEach( () => {
			sandbox.stub( undocumentedMe.prototype, 'deleteAccountRecoveryEmail' )
				.callsArgWithAsync( 0, null, testConstants.DUMMY_DELETE_EMAIL_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', () => {
			SecurityCheckupActions.deleteEmail();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DELETE_ACCOUNT_RECOVERY_EMAIL
			} );
		} );

		it( 'should call the WP.com REST API', () => {
			SecurityCheckupActions.deleteEmail();

			expect( undocumentedMe.prototype.deleteAccountRecoveryEmail ).to.have.been.called;
		} );

		it( 'should dispatch a ServerAction', done => {
			SecurityCheckupActions.deleteEmail();

			process.nextTick( () => {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: actions.RECEIVE_DELETED_ACCOUNT_RECOVERY_EMAIL,
					data: testConstants.DUMMY_DELETE_EMAIL_RESPONSE,
					error: null
				} );

				done();
			} );
		} );
	} );

	describe( 'updatePhone()', () => {
		beforeEach( () => {
			sandbox.stub( undocumentedMe.prototype, 'updateAccountRecoveryPhone' )
				.callsArgWithAsync( 2, null, testConstants.DUMMY_UPDATE_PHONE_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', () => {
			SecurityCheckupActions.updatePhone( testConstants.DUMMY_PHONE );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.UPDATE_ACCOUNT_RECOVERY_PHONE,
				phone: testConstants.DUMMY_PHONE
			} );
		} );

		it( 'should call the WP.com REST API', () => {
			SecurityCheckupActions.updatePhone( testConstants.DUMMY_PHONE );

			expect( undocumentedMe.prototype.updateAccountRecoveryPhone ).to.have.been.calledWith(
				testConstants.DUMMY_PHONE_COUNTRY,
				testConstants.DUMMY_PHONE_NUMBER
			);
		} );

		it( 'should dispatch a ServerAction', done => {
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

	describe( 'deletePhone()', () => {
		beforeEach( () => {
			sandbox.stub( undocumentedMe.prototype, 'deleteAccountRecoveryPhone' )
				.callsArgWithAsync( 0, null, testConstants.DUMMY_DELETE_PHONE_RESPONSE );
		} );

		it( 'should dispatch a ViewAction', () => {
			SecurityCheckupActions.deletePhone();

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: actions.DELETE_ACCOUNT_RECOVERY_PHONE
			} );
		} );

		it( 'should call the WP.com REST API', () => {
			SecurityCheckupActions.deletePhone();

			expect( undocumentedMe.prototype.deleteAccountRecoveryPhone ).to.have.been.called;
		} );

		it( 'should dispatch a ServerAction', done => {
			SecurityCheckupActions.deletePhone();

			process.nextTick( () => {
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
