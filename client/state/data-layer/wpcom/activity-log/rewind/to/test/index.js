/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveRestoreSuccess } from '../';
import { getRewindRestoreProgress } from 'state/activity-log/actions';

const siteId = 77203074;
const timestamp = 1496768464;
const restoreId = 12345;

const SUCCESS_RESPONSE = deepFreeze( {
	ok: true,
	error: '',
	restore_id: restoreId,
} );

describe( 'receiveRestoreSuccess', () => {
	test( 'should dispatch get restore progress on success', () => {
		const dispatch = sinon.spy();
		receiveRestoreSuccess( { dispatch }, { siteId, timestamp }, SUCCESS_RESPONSE );
		expect( dispatch ).to.have.been.calledWith( getRewindRestoreProgress( siteId, restoreId ) );
	} );
} );
