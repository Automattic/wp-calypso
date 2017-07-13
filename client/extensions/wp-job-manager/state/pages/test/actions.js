/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_FETCH_PAGES,
	WP_JOB_MANAGER_FETCH_PAGES_ERROR,
	WP_JOB_MANAGER_UPDATE_PAGES,
} from '../../action-types';
import {
	fetchPages,
	fetchPagesError,
	updatePages,
} from '../actions';

describe( 'actions', () => {
	const siteId = 123456;
	const pages = {
		id: 1,
		title: { rendered: 'My page' },
	};

	describe( '#fetchPages()', () => {
		it( 'should return an action object', () => {
			const action = fetchPages( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_PAGES,
				siteId,
			} );
		} );
	} );

	describe( '#fetchPagesError()', () => {
		it( 'should return an action object', () => {
			const action = fetchPagesError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_FETCH_PAGES_ERROR,
				siteId,
			} );
		} );
	} );

	describe( '#updatePages()', () => {
		it( 'should return an action object', () => {
			const action = updatePages( siteId, pages );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_UPDATE_PAGES,
				data: pages,
				siteId,
			} );
		} );
	} );
} );
