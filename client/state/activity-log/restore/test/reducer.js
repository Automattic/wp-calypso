/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { restoreProgress } from '../reducer';
import {
    rewindRestore,
    rewindRestoreUpdateError,
} from '../../actions';

/**
 * Constants
 */
const SITE_ID = 987;
const TIMESTAMP = 1496926224;
const ERROR = deepFreeze( {
	error: 'vp_api_error',
	message: 'Unable to find a valid site.',
} );

describe( '#restoreProgress()', () => {
	it( 'should start at 0% queued', () => {
		const state = restoreProgress( undefined, rewindRestore( SITE_ID, TIMESTAMP ) );
		expect( state[ SITE_ID ] ).to.deep.equal( {
			errorCode: '',
			failureReason: '',
			message: '',
			percent: 0,
			status: 'queued',
			timestamp: TIMESTAMP,
		} );
	} );

	it( 'should preserve other sites', () => {
		const otherSiteId = 123456;
		const prevState = deepFreeze( {
			[ otherSiteId ]: {
				active: false,
				firstBackupDate: '',
				isPressable: false,
				plan: 'jetpack-free',
			},
		} );

		[
			restoreProgress( prevState, rewindRestore( SITE_ID, TIMESTAMP ) ),
			restoreProgress( prevState, rewindRestoreUpdateError( SITE_ID, TIMESTAMP, ERROR ) ),
		].forEach(
			state => expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] )
		);
	} );
} );
