/** @format */
/**
 * Internal dependencies
 */
import { receiveRestoreSuccess } from '../';
import { getRewindRestoreProgress } from 'state/activity-log/actions';
import { requestRewindState } from 'state/rewind/actions';

const siteId = 77203074;
const timestamp = 1496768464;
const restoreId = 12345;

describe( 'receiveRestoreSuccess', () => {
	test( 'should dispatch get restore progress on success', () => {
		expect( receiveRestoreSuccess( { siteId, timestamp }, restoreId ) ).toEqual( [
			getRewindRestoreProgress( siteId, restoreId ),
			requestRewindState( siteId ),
		] );
	} );
} );
