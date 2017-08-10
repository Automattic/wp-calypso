/** @format */
/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveRestoreProgress } from '../';
import { updateRewindRestoreProgress } from 'state/activity-log/actions';

const siteId = 77203074;
const timestamp = 1496768464;
const restoreId = 12345;

const FINISHED_RESPONSE = deepFreeze( {
	error: '',
	ok: '',
	restore_status: {
		error_code: '',
		failure_reason: '',
		message: '',
		percent: 100,
		status: 'finished',
	},
} );

describe( 'receiveRestoreProgress', () => {
	it( 'should dispatch updateRewindRestoreProgress', () => {
		const dispatch = sinon.spy();
		receiveRestoreProgress( { dispatch }, { siteId, timestamp, restoreId }, FINISHED_RESPONSE );
		const expectedAction = updateRewindRestoreProgress( siteId, timestamp, restoreId, {
			errorCode: '',
			failureReason: '',
			message: '',
			percent: 100,
			status: 'finished',
		} );
		expectedAction.freshness = sinon.match.number;
		expect( dispatch ).to.have.been.calledWith( expectedAction );
	} );
} );
