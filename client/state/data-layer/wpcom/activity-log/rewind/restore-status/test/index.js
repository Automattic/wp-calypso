import deepFreeze from 'deep-freeze';
import { updateRewindRestoreProgress } from 'calypso/state/activity-log/actions';
import { fromApi, updateProgress } from '../';

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
