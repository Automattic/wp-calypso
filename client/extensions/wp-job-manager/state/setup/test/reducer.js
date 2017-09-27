/** @format */

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
import reducer, { creating, fetching, nextStep, status } from '../reducer';

describe( 'reducer', () => {
	test( 'should initialize to an empty object', () => {
		expect( reducer( undefined, { type: '@@UNKNOWN_ACTION' } ) ).to.eql( {} );
	} );

	describe( 'creating()', () => {
		test( 'should default to false', () => {
			const state = creating( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.eql( false );
		} );

		test( 'should set state to true if pages are being created', () => {
			const state = creating( undefined, { type: WP_JOB_MANAGER_CREATE_PAGES } );

			expect( state ).to.eql( true );
		} );

		test( 'should set state to false if not all pages were created', () => {
			const state = creating( undefined, { type: WP_JOB_MANAGER_CREATE_PAGES_ERROR } );

			expect( state ).to.eql( false );
		} );

		test( 'should set state to false if moving to the next step of the wizard', () => {
			const state = creating( undefined, { type: WP_JOB_MANAGER_WIZARD_NEXT_STEP } );

			expect( state ).to.eql( false );
		} );
	} );

	describe( 'fetching()', () => {
		test( 'should default to false', () => {
			const state = fetching( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.eql( false );
		} );

		test( 'should set state to true if setup status is being fetched', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_FETCH_SETUP_STATUS } );

			expect( state ).to.eql( true );
		} );

		test( 'should set state to false if setup status could not be fetched', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR } );

			expect( state ).to.eql( false );
		} );

		test( 'should set state to false if updating setup status', () => {
			const state = fetching( undefined, { type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS } );

			expect( state ).to.eql( false );
		} );
	} );

	describe( 'nextStep()', () => {
		test( 'should default to false', () => {
			const state = nextStep( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.eql( false );
		} );

		test( 'should set state to true if moving to the next step of the wizard', () => {
			const state = nextStep( undefined, { type: WP_JOB_MANAGER_WIZARD_NEXT_STEP } );

			expect( state ).to.eql( true );
		} );
	} );

	describe( 'status()', () => {
		test( 'should default to an empty object', () => {
			const state = status( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should index setup status by site ID', () => {
			const state = status( undefined, {
				type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
				setupStatus: true,
			} );

			expect( state ).to.deep.equal( true );
		} );

		test( 'should override previous setup status', () => {
			const state = status( true, {
				type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
				setupStatus: false,
			} );

			expect( state ).to.deep.equal( false );
		} );
	} );
} );
