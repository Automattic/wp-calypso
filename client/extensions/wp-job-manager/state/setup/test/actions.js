/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_CREATE_PAGES,
	WP_JOB_MANAGER_CREATE_PAGES_ERROR,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR,
	WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
	WP_JOB_MANAGER_WIZARD_NEXT_STEP,
} from '../../action-types';
import {
	createPages,
	createPagesError,
	fetchSetupStatus,
	fetchSetupStatusError,
	nextStep,
	updateSetupStatus,
} from '../actions';

describe( 'actions', () => {
	const siteId = 101010;
	const titles = [ 'Page 1', 'Page 2' ];

	describe( '#createPages()', () => {
		it( 'should return an action object', () => {
			const action = createPages( siteId, titles );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_CREATE_PAGES,
				siteId,
				titles,
			} );
		} );
	} );

	describe( '#createPagesError()', () => {
		it( 'should return an action object', () => {
			const action = createPagesError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_CREATE_PAGES_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#nextStep()', () => {
		it( 'should return an action object', () => {
			const action = nextStep( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_WIZARD_NEXT_STEP,
				siteId,
			} );
		} );
	} );

	describe( '#fetchSetupStatus()', () => {
		it( 'should return an action object', () => {
			const action = fetchSetupStatus( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_SETUP_STATUS,
				siteId,
			} );
		} );
	} );

	describe( '#fetchSetupStatusError()', () => {
		it( 'should return an action object', () => {
			const action = fetchSetupStatusError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#updateSetupStatus()', () => {
		it( 'should return an action object', () => {
			const action = updateSetupStatus( siteId, false );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
				setupStatus: false,
				siteId,
			} );
		} );
	} );
} );
