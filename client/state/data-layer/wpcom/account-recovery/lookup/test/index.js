/**
 * External dependencies
 */
import { assert } from 'chai';
import { identity } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	fromApi,
	validate,
	storeReceivedOptions,
	reportError,
} from '../';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
} from 'state/action-types';

const next = identity;

const validResponse = {
	primary_email: 'a****@example.com',
	secondary_email: 'b*****@example.com',
	primary_sms: '+1******456',
	secondary_sms: '+8*******456',
};

describe( 'storeReceivedOptions()', () => {
	const dispatch = sinon.spy();

	it( 'should dispatch the receiving action.', () => {
		storeReceivedOptions( { dispatch }, {}, next, validResponse );

		assert.isTrue( dispatch.calledWith( {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items: fromApi( validResponse ),
		} ) );
	} );
} );

describe( 'reportError()', () => {
	const dispatch = sinon.spy();

	it( 'should dispatch the error action', () => {
		const error = {
			message: 'Something wrong!',
			status: 404,
		};

		reportError( { dispatch }, {}, next, error );

		assert.isTrue( dispatch.calledWith( {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error,
		} ) );
	} );
} );

describe( 'validate()', () => {
	it( 'should validate successfully and throw nothing.', () => {
		assert.doesNotThrow( () => validate( validResponse ) );
	} );

	it( 'should invalidate missing keys and throw an error.', () => {
		assert.throws( () => validate( {
			primary_email: 'foo@example.com',
		} ), Error );
	} );

	it( 'should invalidate unexpected value type and throw an error', () => {
		assert.throws( () => validate( {
			primary_email: 'foo@example.com',
			primary_sms: '123456',
			secondary_email: 'bar@example.com',
			secondary_sms: 123456,
		} ), Error );
	} );
} );
