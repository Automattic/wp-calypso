/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';
import {
	selectedPostType,
	exportingState,
	advancedSettings
} from '../reducers';
import {
	SAMPLE_ADVANCED_SETTINGS,
	SAMPLE_ADVANCED_SETTINGS_EMPTY,
} from './sample-data';
import { States } from '../constants';

describe( 'reducer', () => {
	describe( 'selectedPostType', () => {
		it( 'persists state', () => {
			const postType = 'feedback';
			const state = selectedPostType( postType, { type: SERIALIZE } );
			expect( state ).to.eql( 'feedback' );
		} );
		it( 'loads persisted state', () => {
			const postType = 'feedback';
			const state = selectedPostType( postType, { type: DESERIALIZE } );
			expect( state ).to.eql( 'feedback' );
		} );
	} );

	describe( 'exportingState', () => {
		it( 'persists state', () => {
			const state = exportingState( States.EXPORTING, { type: SERIALIZE } );
			expect( state ).to.eql( States.EXPORTING );
		} );
		it( 'ignores persisted state since server side checking is not implemented yet', () => {
			const state = exportingState( States.EXPORTING, { type: DESERIALIZE } );
			expect( state ).to.eql( States.READY );
		} );
	} );

	describe( '#advancedSettings()', () => {
		it( 'should persist state', () => {
			const settings = { 100658273: SAMPLE_ADVANCED_SETTINGS };
			const state = advancedSettings( settings, { type: SERIALIZE } );
			expect( state ).to.eql( settings );
		} );

		it( 'should load persisted state', () => {
			const settings = { 100658273: SAMPLE_ADVANCED_SETTINGS };
			const state = advancedSettings( settings, { type: DESERIALIZE } );
			expect( state ).to.eql( settings );
		} );

		it( 'should index settings by site ID', () => {
			const state = advancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS
			} );

			expect( state ).to.eql( {
				100658273: SAMPLE_ADVANCED_SETTINGS
			} );
		} );

		it( 'should replace known settings for site', () => {
			let state = { 100658273: SAMPLE_ADVANCED_SETTINGS };

			state = advancedSettings( state, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS_EMPTY
			} );

			expect( state ).to.eql( {
				100658273: SAMPLE_ADVANCED_SETTINGS_EMPTY
			} );
		} );

		it( 'should not replace known settings with other sites', () => {
			let state = { 100658273: SAMPLE_ADVANCED_SETTINGS };

			state = advancedSettings( state, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 12345,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS_EMPTY
			} );

			expect( state ).to.eql( {
				100658273: SAMPLE_ADVANCED_SETTINGS,
				12345: SAMPLE_ADVANCED_SETTINGS_EMPTY
			} );
		} );
	} );
} );
