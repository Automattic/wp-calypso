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
	WP_JOB_MANAGER_WIZARD_NEXT_STEP,
} from '../../action-types';
import reducer, { creating, nextStep } from '../reducer';

describe( 'reducer', () => {
	it( 'should initialize to an empty object', () => {
		expect( reducer( undefined, { type: '@@UNKNOWN_ACTION' } ) ).to.eql( {} );
	} );

	describe( 'creating()', () => {
		it( 'should default to false', () => {
			const state = creating( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.eql( false );
		} );

		it( 'should set state to true if pages are being created', () => {
			const state = creating( undefined, { type: WP_JOB_MANAGER_CREATE_PAGES } );

			expect( state ).to.eql( true );
		} );

		it( 'should set state to false if not all pages were created', () => {
			const state = creating( undefined, { type: WP_JOB_MANAGER_CREATE_PAGES_ERROR } );

			expect( state ).to.eql( false );
		} );

		it( 'should set state to false if moving to the next step of the wizard', () => {
			const state = creating( undefined, { type: WP_JOB_MANAGER_WIZARD_NEXT_STEP } );

			expect( state ).to.eql( false );
		} );
	} );

	describe( 'nextStep()', () => {
		it( 'should default to false', () => {
			const state = nextStep( undefined, { type: '@@UNKNOWN_ACTION' } );

			expect( state ).to.eql( false );
		} );

		it( 'should set state to true if moving to the next step of the wizard', () => {
			const state = nextStep( undefined, { type: WP_JOB_MANAGER_WIZARD_NEXT_STEP } );

			expect( state ).to.eql( true );
		} );
	} );
} );
