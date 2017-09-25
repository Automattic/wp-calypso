/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { dismissRewindRestoreProgress, rewindRestore, rewindRestoreUpdateError } from '../../actions';
import { restoreProgress } from '../reducer';

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
			freshness: -Infinity,
			message: '',
			percent: 0,
			status: 'queued',
			timestamp: TIMESTAMP,
		} );
	} );

	it( 'should null on dismissal', () => {
		const prevState = deepFreeze( {
			[ SITE_ID ]: {
				percent: 100,
				status: 'finished',
			},
		} );

		const state = restoreProgress( prevState, dismissRewindRestoreProgress( SITE_ID ) );
		expect( state[ SITE_ID ] ).to.be.null;
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
			restoreProgress( prevState, dismissRewindRestoreProgress( SITE_ID ) ),
		].forEach(
			state => expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] )
		);
	} );
} );
