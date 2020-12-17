/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { settings, unsavedSettings } from '../reducer';
import {
	USER_SETTINGS_UPDATE,
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
	USER_SETTINGS_UNSAVED_CLEAR,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'settings',
			'unsavedSettings',
			'pendingPasswordChange',
		] );
	} );

	describe( 'settings', () => {
		test( 'should default to a `null` value', () => {
			const state = settings( undefined, {} );

			expect( state ).to.be.null;
		} );

		test( 'should store user settings after initial update', () => {
			const state = settings( null, {
				type: USER_SETTINGS_UPDATE,
				settingValues: { foo: 'bar' },
			} );

			expect( state ).to.eql( {
				foo: 'bar',
			} );
		} );

		test( 'should keep existing settings after update', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );

			const state = settings( original, {
				type: USER_SETTINGS_UPDATE,
				settingValues: { baz: 'qux' },
			} );

			expect( state ).to.eql( {
				foo: 'bar',
				baz: 'qux',
			} );
		} );
	} );

	describe( 'unsavedSettings', () => {
		test( 'should default to empty object', () => {
			const state = unsavedSettings( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should store a user settings after it is set', () => {
			const state = unsavedSettings( undefined, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: 'foo',
				value: 'bar',
			} );

			expect( state ).to.eql( {
				foo: 'bar',
			} );
		} );

		test( 'should store additional user setting after it is set', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: 'baz',
				value: 'qux',
			} );

			expect( state ).to.eql( {
				foo: 'bar',
				baz: 'qux',
			} );
		} );

		test( 'should remove a user setting', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_REMOVE,
				settingName: 'baz',
			} );

			expect( state ).to.eql( {
				foo: 'bar',
			} );
		} );

		test( 'should clear user settings after successful save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_CLEAR,
			} );

			expect( state ).to.eql( {} );
		} );

		test( 'should clear user settings after successful partial save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_CLEAR,
				settingNames: [ 'baz' ],
			} );

			expect( state ).to.eql( {
				foo: 'bar',
			} );
		} );
	} );
} );
