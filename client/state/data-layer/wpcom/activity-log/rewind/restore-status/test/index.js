/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { useFakeTimers } from 'test/helpers/use-sinon';
import {
	receiveRestoreProgress,
} from '../';
import {
	updateRewindRestoreProgress,
	getRewindRestoreProgress,
} from 'state/activity-log/actions';

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
	}
} );

const RUNNING_RESPONSE = deepFreeze( {
	error: '',
	ok: '',
	restore_status: {
		error_code: '',
		failure_reason: '',
		message: '',
		percent: 32,
		status: 'running',
	}
} );

describe( 'receiveRestoreProgress', () => {
	let clock;

	useFakeTimers( fakeClock => clock = fakeClock );

	it( 'should dispatch updateRewindRestoreProgress', () => {
		const dispatch = sinon.spy();
		receiveRestoreProgress( { dispatch }, { siteId, timestamp, restoreId }, null, FINISHED_RESPONSE );
		expect( dispatch ).to.have.been.calledWith(
			updateRewindRestoreProgress(
				siteId, timestamp, restoreId, {
					errorCode: '',
					failureReason: '',
					message: '',
					percent: 100,
					status: 'finished',
				}
			)
		);
	} );

	it( 'should dispatch another progress request if status not finished', () => {
		const dispatch = sinon.spy();
		receiveRestoreProgress( { dispatch }, { siteId, timestamp, restoreId }, null, RUNNING_RESPONSE );
		clock.tick( 1600 );

		expect( dispatch ).to.have.been.calledTwice;
		expect( dispatch ).to.have.been.calledWith(
			getRewindRestoreProgress(
				siteId, timestamp, restoreId
			)
		);
	} );
} );
