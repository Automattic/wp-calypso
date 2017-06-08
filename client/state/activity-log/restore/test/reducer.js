/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	restoreError,
	restoreProgress,
} from '../reducer';
import {
    rewindCompleteRestore,
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
	it( 'start in progress restore a 0%', () => {
		const state = restoreProgress( undefined, rewindRestore( SITE_ID, TIMESTAMP ) );
		expect( state[ SITE_ID ] ).to.deep.equal( {
			percent: 0,
			status: 'running',
		} );
	} );

	it( 'complete finished restores at 100%', () => {
		const state = restoreProgress( undefined, rewindCompleteRestore( SITE_ID, TIMESTAMP ) );
		expect( state[ SITE_ID ] ).to.deep.equal( {
			percent: 100,
			status: 'success',
		} );
	} );

	it( 'should null on errors', () => {
		const state = restoreProgress( undefined, rewindRestoreUpdateError( SITE_ID, TIMESTAMP, ERROR ) );
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
			restoreProgress( prevState, rewindCompleteRestore( SITE_ID, TIMESTAMP ) ),
			restoreProgress( prevState, rewindRestoreUpdateError( SITE_ID, TIMESTAMP, ERROR ) ),
		].forEach(
			state => expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] )
		);
	} );
} );

describe( '#restoreError()', () => {
} );

