/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	rewindStatus,
	rewindStatusError,
} from '../reducer';
import {
	rewindStatusError as rewindStatusErrorAction,
	updateRewindStatus,
} from '../../actions';

/**
 * Constants
 */
const SITE_ID = 987;
const STATUS_ACTION = deepFreeze( updateRewindStatus( SITE_ID, {
	active: true,
	firstBackupDate: '2017-04-19 12:00:00',
	isPressable: false,
	plan: 'jetpack-business',
} ) );

const ERROR_ACTION = deepFreeze( rewindStatusErrorAction( SITE_ID, {
	error: 'unknown_blog',
	message: 'Unknown blog'
} ) );

describe( '#rewindStatus()', () => {
	it( 'should update site item', () => {
		const state = rewindStatus( undefined, STATUS_ACTION );
		expect( state[ SITE_ID ] ).to.deep.equal( STATUS_ACTION.status );
	} );

	it( 'should preserve other site\'s status', () => {
		const otherSiteId = 123456;
		const prevState = deepFreeze( {
			[ otherSiteId ]: {
				active: false,
				firstBackupDate: '',
				isPressable: false,
				plan: 'jetpack-free',
			},
		} );

		const state = rewindStatus( prevState, STATUS_ACTION );
		expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] );
	} );

	it( 'should remove status on error', () => {
		const prevState = deepFreeze( {
			[ SITE_ID ]: STATUS_ACTION.status,
		} );
		const state = rewindStatus( prevState, ERROR_ACTION );
		expect( state ).to.not.have.ownProperty( SITE_ID );
	} );

	it( 'should preserve other site\'s status on error', () => {
		const otherSiteId = 123456;
		const prevState = deepFreeze( {
			[ otherSiteId ]: {
				active: false,
				firstBackupDate: '',
				isPressable: false,
				plan: 'jetpack-free',
			},
		} );

		const state = rewindStatus( prevState, ERROR_ACTION );
		expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] );
	} );
} );

describe( '#rewindStatusError()', () => {
	it( 'should update site error', () => {
		const state = rewindStatusError( undefined, ERROR_ACTION );
		expect( state[ SITE_ID ] ).to.deep.equal( ERROR_ACTION.error );
	} );

	it( 'should preserve other site\'s error', () => {
		const otherSiteId = 123456;
		const prevState = deepFreeze( {
			otherSiteId: {
				error: 'an_error',
				message: 'This is an error message.'
			}
		} );

		const state = rewindStatusError( prevState, ERROR_ACTION );
		expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] );
	} );

	it( 'should remove error on status', () => {
		const prevState = deepFreeze( {
			[ SITE_ID ]: ERROR_ACTION.error,
		} );
		const state = rewindStatusError( prevState, STATUS_ACTION );
		expect( state ).to.not.have.ownProperty( SITE_ID );
	} );

	it( 'should preserve other site\'s error on status', () => {
		const otherSiteId = 123456;
		const prevState = deepFreeze( {
			[ otherSiteId ]: {
				error: 'an_error',
				message: 'This is an error message.'
			},
		} );

		const state = rewindStatusError( prevState, STATUS_ACTION );
		expect( state[ otherSiteId ] ).to.deep.equal( prevState[ otherSiteId ] );
	} );
} );

