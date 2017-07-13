/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_REQUEST_PAGES,
	WP_JOB_MANAGER_REQUEST_PAGES_ERROR,
	WP_JOB_MANAGER_UPDATE_PAGES,
} from '../../action-types';
import {
	requestPages,
	requestPagesError,
	updatePages,
} from '../actions';

describe( 'actions', () => {
	const siteId = 123456;
	const pages = {
		id: 1,
		title: { rendered: 'My page' },
	};

	describe( '#requestPages()', () => {
		it( 'should return an action object', () => {
			const action = requestPages( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_REQUEST_PAGES,
				siteId,
			} );
		} );
	} );

	describe( '#requestPagesError()', () => {
		it( 'should return an action object', () => {
			const action = requestPagesError( siteId );

			expect( action ).to.deep.equal( {
				type: WP_JOB_MANAGER_REQUEST_PAGES_ERROR,
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
