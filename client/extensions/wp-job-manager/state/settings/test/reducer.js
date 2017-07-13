/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_REQUEST_SETTINGS,
	WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR,
	WP_JOB_MANAGER_SAVE_ERROR,
	WP_JOB_MANAGER_SAVE_SETTINGS,
	WP_JOB_MANAGER_SAVE_SUCCESS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../../action-types';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import reducer, { requesting, items, saving } from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items',
			'saving',
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

		it( 'should set state to true if settings are being requested', () => {
			const state = requesting( undefined, {
				type: WP_JOB_MANAGER_REQUEST_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const state = requesting( previousState, {
				type: WP_JOB_MANAGER_REQUEST_SETTINGS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set state to false if updating settings', () => {
			const state = requesting( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set state to false if settings could not be requested', () => {
			const state = requesting( previousState, {
				type: WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR,
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

	describe( 'saving()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = saving( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should set state to true if settings are being saved', () => {
			const state = saving( undefined, {
				type: WP_JOB_MANAGER_SAVE_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate saving values', () => {
			const state = saving( previousState, {
				type: WP_JOB_MANAGER_SAVE_SETTINGS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set state to false if settings were saved successfully', () => {
			const state = saving( previousState, {
				type: WP_JOB_MANAGER_SAVE_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set state to false if settings could not be saved', () => {
			const state = saving( previousState, {
				type: WP_JOB_MANAGER_SAVE_ERROR,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should not persist state', () => {
			const state = saving( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = saving( previousState, {
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

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should index settings by site ID', () => {
			const state = items( undefined, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: primarySiteId,
				data: primarySettings,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		it( 'should accumulate settings', () => {
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

		it( 'should override previous settings of same site ID', () => {
			const state = items( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETTINGS,
				siteId: primarySiteId,
				data: secondarySettings,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: secondarySettings,
			} );
		} );

		it( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
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

		it( 'should persist state', () => {
			const state = items( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		it( 'should not load invalid persisted state', () => {
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
