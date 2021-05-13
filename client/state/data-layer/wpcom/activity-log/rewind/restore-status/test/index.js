/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { fromApi, updateProgress } from '../';
import { updateRewindRestoreProgress } from 'calypso/state/activity-log/actions';

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
		rewindId: '',
		context: 'main',
		currentEntry: '',
	},
} );

describe( 'receiveRestoreProgress', () => {
	test( 'should dispatch updateRewindRestoreProgress', () => {
		const action = updateProgress( { siteId, timestamp, restoreId }, fromApi( FINISHED_RESPONSE ) );
		const expectedAction = updateRewindRestoreProgress( siteId, timestamp, restoreId, {
			errorCode: '',
			failureReason: '',
			message: '',
			percent: 100,
			status: 'finished',
			rewindId: '',
			context: 'main',
			currentEntry: '',
		} );
		expect( action ).toEqual( expectedAction );
	} );
} );
