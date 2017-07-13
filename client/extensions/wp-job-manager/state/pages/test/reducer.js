/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_REQUEST_PAGES,
	WP_JOB_MANAGER_REQUEST_PAGES_ERROR,
	WP_JOB_MANAGER_UPDATE_PAGES,
} from '../../action-types';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import reducer, { requesting, items } from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items',
		] );
	} );

	describe( 'requesting()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should set state to true if pages are being requested', () => {
			const state = requesting( undefined, {
				type: WP_JOB_MANAGER_REQUEST_PAGES,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = requesting( previousState, {
				type: WP_JOB_MANAGER_REQUEST_PAGES,
				siteId: secondarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set state to false if updating pages', () => {
			const state = requesting( previousState, {
				type: WP_JOB_MANAGER_UPDATE_PAGES,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set state to false if pages could not be requested', () => {
			const state = requesting( previousState, {
				type: WP_JOB_MANAGER_REQUEST_PAGES_ERROR,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should not persist state', () => {
			const state = requesting( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( 'items()', () => {
		const primaryPages = {
			id: 1,
			title: { rendered: 'My page' }
		};
		const secondaryPages = {
			id: 2,
			title: { rendered: 'My secondary page' }
		};
		const previousState = deepFreeze( {
			[ primarySiteId ]: primaryPages,
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should index pages by site ID', () => {
			const state = items( undefined, {
				type: WP_JOB_MANAGER_UPDATE_PAGES,
				siteId: primarySiteId,
				data: primaryPages,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primaryPages,
			} );
		} );

		it( 'should accumulate pages', () => {
			const state = items( previousState, {
				type: WP_JOB_MANAGER_UPDATE_PAGES,
				siteId: secondarySiteId,
				data: secondaryPages,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primaryPages,
				[ secondarySiteId ]: secondaryPages,
			} );
		} );

		it( 'should override previous pages of same site ID', () => {
			const state = items( previousState, {
				type: WP_JOB_MANAGER_UPDATE_PAGES,
				siteId: primarySiteId,
				data: secondaryPages,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: secondaryPages,
			} );
		} );

		it( 'should accumulate new pages and overwrite existing ones for the same site ID', () => {
			const newPages = {
				id: 3,
				title: { rendered: 'My new page' }
			};
			const state = items( previousState, {
				type: WP_JOB_MANAGER_UPDATE_PAGES,
				siteId: primarySiteId,
				data: newPages,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: newPages,
			} );
		} );

		it( 'should not persist state', () => {
			const state = items( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = items( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
