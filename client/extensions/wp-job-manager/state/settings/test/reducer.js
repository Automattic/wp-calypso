/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_FETCH_ERROR,
	WP_JOB_MANAGER_FETCH_SETTINGS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../../action-types';
import reducer, { fetching, items } from '../reducer';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'fetching', 'items' ] );
	} );

	describe( 'fetching()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		test( 'should default to an empty object', () => {
			const state = fetching( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should set state to true if settings are being fetched', () => {
			const state = fetching( undefined, {
				type: WP_JOB_MANAGER_FETCH_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		test( 'should accumulate fetching values', () => {
			const state = fetching( previousState, {
				type: WP_JOB_MANAGER_FETCH_SETTINGS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		test( 'should set state to false if updating settings', () => {
			const state = fetching( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should set state to false if settings could not be fetched', () => {
			const state = fetching( previousState, {
				type: WP_JOB_MANAGER_FETCH_ERROR,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = fetching( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should not load persisted state', () => {
			const state = fetching( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );

	describe( 'items()', () => {
		const primarySettings = { job_manager_hide_filled_positions: true };
		const secondarySettings = { job_manager_hide_filled_positions: false };
		const previousState = deepFreeze( {
			[ primarySiteId ]: primarySettings,
		} );

		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		test( 'should index settings by site ID', () => {
			const state = items( undefined, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: primarySiteId,
				data: primarySettings,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		test( 'should accumulate settings', () => {
			const state = items( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: secondarySiteId,
				data: secondarySettings,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primarySettings,
				[ secondarySiteId ]: secondarySettings,
			} );
		} );

		test( 'should override previous settings of same site ID', () => {
			const state = items( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: primarySiteId,
				data: secondarySettings,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: secondarySettings,
			} );
		} );

		test( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const newSettings = {
				job_manager_hide_expired: false,
				job_manager_hide_filled_positions: true,
			};
			const state = items( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: primarySiteId,
				data: newSettings,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: newSettings,
			} );
		} );

		test( 'should persist state', () => {
			const state = items( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		test( 'should load valid persisted state', () => {
			const state = items( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				[ primarySiteId ]: 2,
			} );
			const state = items( previousInvalidState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );
	} );
} );
