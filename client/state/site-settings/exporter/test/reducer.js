/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_FAIL,
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	EXPORT_POST_TYPE_FIELD_SET,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';
import {
	selectedPostType,
	selectedAdvancedSettings,
	exportingState,
	advancedSettings,
	fetchingAdvancedSettings
} from '../reducers';
import {
	SAMPLE_ADVANCED_SETTINGS,
	SAMPLE_ADVANCED_SETTINGS_EMPTY,
} from './data';
import { States } from '../constants';

describe( 'reducer', () => {
	describe( 'selectedPostType', () => {
		it( 'does not persist state', () => {
			const postType = 'feedback';
			const state = selectedPostType( postType, { type: SERIALIZE } );
			expect( state ).to.be.null;
		} );
		it( 'does not load persisted state', () => {
			const postType = 'feedback';
			const state = selectedPostType( postType, { type: DESERIALIZE } );
			expect( state ).to.be.null;
		} );
	} );

	describe( 'selectedAdvancedSettings', () => {
		const selectedSettings = {
			2916284: {
				post: { category: 1 },
				page: { author: 95752520 },
			}
		};
		it( 'does not persist state', () => {
			const state = selectedAdvancedSettings( selectedSettings, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );
		it( 'does not load persisted state', () => {
			const state = selectedAdvancedSettings( selectedSettings, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'should set post category', () => {
			const state = selectedAdvancedSettings( {}, {
				type: EXPORT_POST_TYPE_FIELD_SET,
				siteId: 2916284,
				postType: 'post',
				fieldName: 'category',
				value: 1,
			} );
			expect( state ).to.deep.equal( {
				2916284: {
					post: { category: 1 },
					page: {},
				}
			} );
		} );

		it( 'should set page author', () => {
			const state = selectedAdvancedSettings( {}, {
				type: EXPORT_POST_TYPE_FIELD_SET,
				siteId: 2916284,
				postType: 'page',
				fieldName: 'author',
				value: 95752520,
			} );
			expect( state ).to.deep.equal( {
				2916284: {
					post: {},
					page: { author: 95752520 },
				}
			} );
		} );
	} );

	describe( 'exportingState', () => {
		it( 'does not persist state', () => {
			const state = exportingState( { 100658273: States.EXPORTING }, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );
		it( 'does not load persisted state', () => {
			const state = exportingState( { 100658273: States.EXPORTING }, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#fetchingAdvancedSettings()', () => {
		it( 'should not persist state', () => {
			const state = fetchingAdvancedSettings( { 100658273: true }, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = fetchingAdvancedSettings( { 100658273: true }, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'should index fetching status by site ID', () => {
			const state = fetchingAdvancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_FETCH,
				siteId: 100658273
			} );
			expect( state ).to.eql( { 100658273: true } );
		} );

		it( 'should reset fetching status after receive', () => {
			const state = fetchingAdvancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: {}
			} );
			expect( state ).to.eql( { 100658273: false } );
		} );

		it( 'should reset fetching status after fail', () => {
			const state = fetchingAdvancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_FAIL,
				siteId: 100658273,
				advancedSettings: {}
			} );
			expect( state ).to.eql( { 100658273: false } );
		} );

		it( 'should not replace fetching status with other site', () => {
			const state = fetchingAdvancedSettings( {
				100658273: true
			}, {
				type: EXPORT_ADVANCED_SETTINGS_FETCH,
				siteId: 12345
			} );
			expect( state ).to.eql( {
				100658273: true,
				12345: true
			} );
		} );
	} );

	describe( '#advancedSettings()', () => {
		it( 'does not persist data because this is not implemented yet', () => {
			const settings = { 100658273: SAMPLE_ADVANCED_SETTINGS };
			const state = advancedSettings( settings, { type: SERIALIZE } );
			expect( state ).to.eql( {} );
		} );

		it( 'does not load persisted data because this is not implemented yet', () => {
			const settings = { 100658273: SAMPLE_ADVANCED_SETTINGS };
			const state = advancedSettings( settings, { type: DESERIALIZE } );
			expect( state ).to.eql( {} );
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
