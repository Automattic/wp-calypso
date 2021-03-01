/**
 * Internal dependencies
 */
import { receiveRestoreSuccess } from '../';
import { getRewindRestoreProgress } from 'calypso/state/activity-log/actions';
import { requestRewindState } from 'calypso/state/rewind/state/actions';

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
