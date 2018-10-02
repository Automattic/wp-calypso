/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	selectedAdvancedSettings,
	advancedSettings,
	fetchingAdvancedSettings,
	contentExportUrl,
	mediaExportUrl,
} from '../reducers';
import { SAMPLE_ADVANCED_SETTINGS, SAMPLE_ADVANCED_SETTINGS_EMPTY } from './data';
import {
	EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	EXPORT_POST_TYPE_FIELD_SET,
	EXPORT_COMPLETE,
	EXPORT_CLEAR,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( 'selectedAdvancedSettings', () => {
		test( 'should set post category', () => {
			const state = selectedAdvancedSettings(
				{},
				{
					type: EXPORT_POST_TYPE_FIELD_SET,
					siteId: 2916284,
					postType: 'post',
					fieldName: 'category',
					value: 1,
				}
			);
			expect( state ).to.deep.equal( {
				2916284: {
					post: { category: 1 },
					page: {},
				},
			} );
		} );

		test( 'should set page author', () => {
			const state = selectedAdvancedSettings(
				{},
				{
					type: EXPORT_POST_TYPE_FIELD_SET,
					siteId: 2916284,
					postType: 'page',
					fieldName: 'author',
					value: 95752520,
				}
			);
			expect( state ).to.deep.equal( {
				2916284: {
					post: {},
					page: { author: 95752520 },
				},
			} );
		} );
	} );

	describe( '#fetchingAdvancedSettings()', () => {
		test( 'should index fetching status by site ID', () => {
			const state = fetchingAdvancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_FETCH,
				siteId: 100658273,
			} );
			expect( state ).to.eql( { 100658273: true } );
		} );

		test( 'should reset fetching status after receive', () => {
			const state = fetchingAdvancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: {},
			} );
			expect( state ).to.eql( { 100658273: false } );
		} );

		test( 'should reset fetching status after fail', () => {
			const state = fetchingAdvancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
				siteId: 100658273,
				advancedSettings: {},
			} );
			expect( state ).to.eql( { 100658273: false } );
		} );

		test( 'should not replace fetching status with other site', () => {
			const state = fetchingAdvancedSettings(
				{
					100658273: true,
				},
				{
					type: EXPORT_ADVANCED_SETTINGS_FETCH,
					siteId: 12345,
				}
			);
			expect( state ).to.eql( {
				100658273: true,
				12345: true,
			} );
		} );
	} );

	describe( '#advancedSettings()', () => {
		test( 'should index settings by site ID', () => {
			const state = advancedSettings( null, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS,
			} );

			expect( state ).to.eql( {
				100658273: SAMPLE_ADVANCED_SETTINGS,
			} );
		} );

		test( 'should replace known settings for site', () => {
			let state = { 100658273: SAMPLE_ADVANCED_SETTINGS };

			state = advancedSettings( state, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS_EMPTY,
			} );

			expect( state ).to.eql( {
				100658273: SAMPLE_ADVANCED_SETTINGS_EMPTY,
			} );
		} );

		test( 'should not replace known settings with other sites', () => {
			let state = { 100658273: SAMPLE_ADVANCED_SETTINGS };

			state = advancedSettings( state, {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 12345,
				advancedSettings: SAMPLE_ADVANCED_SETTINGS_EMPTY,
			} );

			expect( state ).to.eql( {
				100658273: SAMPLE_ADVANCED_SETTINGS,
				12345: SAMPLE_ADVANCED_SETTINGS_EMPTY,
			} );
		} );
	} );

	describe( '#contentExportUrl', () => {
		test( 'should store the content export url field.', () => {
			const expectedUrl = 'https://examples.com/content';
			expect(
				contentExportUrl( null, {
					type: EXPORT_COMPLETE,
					contentExportUrl: expectedUrl,
				} )
			).to.eql( expectedUrl );
		} );

		test( 'should become null.', () => {
			expect(
				contentExportUrl( 'something', {
					type: EXPORT_CLEAR,
				} )
			).to.be.null;
		} );
	} );

	describe( '#mediaExportUrl', () => {
		test( 'should store the media export url field.', () => {
			const expectedUrl = 'https://examples.com/media';
			expect(
				mediaExportUrl( null, {
					type: EXPORT_COMPLETE,
					mediaExportUrl: expectedUrl,
				} )
			).to.eql( expectedUrl );
		} );

		test( 'should become null.', () => {
			expect(
				mediaExportUrl( 'something', {
					type: EXPORT_CLEAR,
				} )
			).to.be.null;
		} );
	} );
} );
