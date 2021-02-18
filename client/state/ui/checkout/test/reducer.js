/**
 * Internal dependencies
 */
import {
	CHECKOUT_TOGGLE_CART_ON_MOBILE,
	DESERIALIZE,
	SECTION_SET,
	SERIALIZE,
} from 'calypso/state/action-types';
import reducer, { isShowingCartOnMobile, upgradeIntent } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [
			'isShowingCartOnMobile',
			'upgradeIntent',
		] );
	} );

	describe( '#isShowingCartOnMobile', () => {
		test( 'should default to false', () => {
			const state = isShowingCartOnMobile( undefined, {} );
			expect( state ).toBeFalse;
		} );

		test( 'should be true after toggle when false', () => {
			const state = isShowingCartOnMobile( false, { type: CHECKOUT_TOGGLE_CART_ON_MOBILE } );
			expect( state ).toBeTrue;
		} );

		test( 'should be false after toggle when true', () => {
			const state = isShowingCartOnMobile( true, { type: CHECKOUT_TOGGLE_CART_ON_MOBILE } );
			expect( state ).toBeFalse;
		} );

		test( 'should be unchanged after other action', () => {
			const state = isShowingCartOnMobile( true, { type: 'WRONSKI_FEINT' } );
			expect( state ).toBeTrue;
		} );
	} );

	describe( '#upgradeIntent()', () => {
		test( 'should persist value', () => {
			const state = upgradeIntent( 'hallows', { type: SERIALIZE } );
			expect( state ).toBe( 'hallows' );
		} );

		test( 'should restore value', () => {
			const state = upgradeIntent( 'always', { type: DESERIALIZE } );
			expect( state ).toBe( 'always' );
		} );

		test( 'should default to empty string', () => {
			const state = upgradeIntent( undefined, {} );
			expect( state ).toBe( '' );
		} );

		test( 'should return existing state for unsupported action type', () => {
			const state = upgradeIntent( 'penseive', { type: 'EXPECTO_PATRONUM' } );
			expect( state ).toBe( 'penseive' );
		} );

		test( 'should return existing state without section name', () => {
			const state = upgradeIntent( 'time turner', { type: SECTION_SET } );
			expect( state ).toBe( 'time turner' );
		} );

		test( 'should return existing state while loading', () => {
			const state = upgradeIntent( 'quaffle', { type: SECTION_SET, isLoading: true } );
			expect( state ).toBe( 'quaffle' );
		} );

		test( 'should return existing state for checkout', () => {
			const state = upgradeIntent( 'bludger', {
				type: SECTION_SET,
				section: { name: 'checkout' },
			} );
			expect( state ).toBe( 'bludger' );
		} );

		test( 'should return existing state for checkout-thank-you', () => {
			const state = upgradeIntent( 'snitch', {
				type: SECTION_SET,
				section: { name: 'checkout-thank-you' },
			} );
			expect( state ).toBe( 'snitch' );
		} );

		test( 'should return existing state for plans', () => {
			const state = upgradeIntent( 'nimbus', {
				type: SECTION_SET,
				section: { name: 'plans' },
			} );
			expect( state ).toBe( 'nimbus' );
		} );

		test( 'should return plugins for plugins', () => {
			const state = upgradeIntent( 'firebolt', {
				type: SECTION_SET,
				section: { name: 'plugins' },
			} );
			expect( state ).toBe( 'plugins' );
		} );

		test( 'should return themes for themes', () => {
			const state = upgradeIntent( 'hippogryph', {
				type: SECTION_SET,
				section: { name: 'themes' },
			} );
			expect( state ).toBe( 'themes' );
		} );

		test( 'should return hosting for hosting', () => {
			const state = upgradeIntent( 'blastendedskrewt', {
				type: SECTION_SET,
				section: { name: 'hosting' },
			} );
			expect( state ).toBe( 'hosting' );
		} );

		test( 'should return empty string for other section', () => {
			const state = upgradeIntent( 'plugins', {
				type: SECTION_SET,
				section: { name: 'restricted section' },
			} );
			expect( state ).toBe( '' );
		} );
	} );
} );
