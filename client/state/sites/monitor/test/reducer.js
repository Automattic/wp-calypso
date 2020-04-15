/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, requesting, updating } from '../reducer';
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'items', 'requesting', 'updating' ] );
	} );

	describe( '#items()', () => {
		const settings = {
			email_notifications: true,
			monitor_active: true,
			wp_note_notifications: true,
		};
		const otherSettings = {
			...settings,
			wp_note_notifications: false,
		};

		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store monitor settings when received', () => {
			const state = items( undefined, {
				type: SITE_MONITOR_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).to.eql( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate monitor settings when receiving for new sites', () => {
			const original = deepFreeze( {
				2916284: settings,
			} );
			const state = items( original, {
				type: SITE_MONITOR_SETTINGS_RECEIVE,
				siteId: 77203074,
				settings: otherSettings,
			} );

			expect( state ).to.eql( {
				2916284: settings,
				77203074: otherSettings,
			} );
		} );

		test( 'should overwrite monitor settings when receiving for an existing site', () => {
			const original = deepFreeze( {
				2916284: settings,
				77203074: settings,
			} );
			const state = items( original, {
				type: SITE_MONITOR_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: otherSettings,
			} );

			expect( state ).to.eql( {
				2916284: otherSettings,
				77203074: settings,
			} );
		} );

		test( 'should not persist state', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track monitor settings request when started', () => {
			const state = requesting( undefined, {
				type: SITE_MONITOR_SETTINGS_REQUEST,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate monitor settings requests when started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: SITE_MONITOR_SETTINGS_REQUEST,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should track monitor settings request when succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should track monitor settings request when failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );
			const state = requesting( original, {
				type: SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );

	describe( 'updating()', () => {
		test( 'should default to an empty object', () => {
			const state = updating( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should track monitor settings update when started', () => {
			const state = updating( undefined, {
				type: SITE_MONITOR_SETTINGS_UPDATE,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: true,
			} );
		} );

		test( 'should accumulate monitor settings updates when started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = updating( original, {
				type: SITE_MONITOR_SETTINGS_UPDATE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: true,
				77203074: true,
			} );
		} );

		test( 'should track monitor settings update when succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );
			const state = updating( original, {
				type: SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: true,
			} );
		} );

		test( 'should track monitor settings update when failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );
			const state = updating( original, {
				type: SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
				siteId: 77203074,
			} );

			expect( state ).to.eql( {
				2916284: false,
				77203074: false,
			} );
		} );
	} );
} );
