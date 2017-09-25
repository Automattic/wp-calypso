/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { WP_JOB_MANAGER_CREATE_PAGES, WP_JOB_MANAGER_CREATE_PAGES_ERROR, WP_JOB_MANAGER_WIZARD_NEXT_STEP } from '../../action-types';
import { createPages, createPagesError, nextStep } from '../actions';

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
} );
