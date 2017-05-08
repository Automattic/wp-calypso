/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	USER_SETTINGS_UPDATE,
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
	USER_SETTINGS_UNSAVED_CLEAR,
} from 'state/action-types';
import reducer, { settings, unsavedSettings } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'settings',
			'unsavedSettings',
		] );
	} );

	describe( 'settings', () => {
		it( 'should default to a `null` value', () => {
			const state = settings( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should store user settings after initial update', () => {
			const state = settings( null, {
				type: USER_SETTINGS_UPDATE,
				settingValues: { foo: 'bar' }
			} );

			expect( state ).to.eql( {
				foo: 'bar'
			} );
		} );

		it( 'should keep existing settings after update', () => {
			const original = deepFreeze( {
				foo: 'bar'
			} );

			const state = settings( original, {
				type: USER_SETTINGS_UPDATE,
				settingValues: { baz: 'qux' }
			} );

			expect( state ).to.eql( {
				foo: 'bar',
				baz: 'qux'
			} );
		} );
	} );

	describe( 'unsavedSettings', () => {
		it( 'should default to empty object', () => {
			const state = unsavedSettings( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should store a user settings after it is set', () => {
			const state = unsavedSettings( undefined, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: 'foo',
				value: 'bar'
			} );

			expect( state ).to.eql( {
				foo: 'bar'
			} );
		} );

		it( 'should store additional user setting after it is set', () => {
			const original = deepFreeze( {
				foo: 'bar'
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: 'baz',
				value: 'qux'
			} );

			expect( state ).to.eql( {
				foo: 'bar',
				baz: 'qux'
			} );
		} );

		it( 'should remove a user setting', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux'
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_REMOVE,
				settingName: 'baz'
			} );

			expect( state ).to.eql( {
				foo: 'bar'
			} );
		} );

		it( 'should clear user settings after successful save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux'
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_CLEAR
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should clear user settings after successful partial save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux'
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_CLEAR,
				settingNames: [ 'baz' ]
			} );

			expect( state ).to.eql( {
				foo: 'bar'
			} );
		} );
	} );
} );
