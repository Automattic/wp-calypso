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
			percent: 0,
			status: 'queued',
			timestamp: TIMESTAMP,
		} );
	} );

	it( 'should null on errors', () => {
		const prevState = deepFreeze( {
			[ SITE_ID ]: {
				active: false,
				firstBackupDate: '',
				isPressable: false,
				plan: 'jetpack-free',
			},
		} );

		const state = restoreProgress( prevState, rewindRestoreUpdateError( SITE_ID, TIMESTAMP, ERROR ) );
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
		].forEach(
			state => expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] )
		);
	} );
} );

describe( '#restoreError()', () => {
	it( 'should insert errors', () => {
		const state = restoreError( undefined, rewindRestoreUpdateError( SITE_ID, TIMESTAMP, ERROR ) );
		expect( state[ SITE_ID ] ).to.deep.equal( ERROR );
	} );

	it( 'should null on progress', () => {
		const prevState = deepFreeze( {
			[ SITE_ID ]: ERROR,
		} );
		const state = restoreError( prevState, rewindRestore( SITE_ID, TIMESTAMP ) );
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

		const state = restoreError( prevState, rewindRestoreUpdateError( SITE_ID, TIMESTAMP, ERROR ) );
		expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] );
	} );
} );

