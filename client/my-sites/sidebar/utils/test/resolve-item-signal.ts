/**
 * @jest-environment jsdom
 *
 * Unit tests for `resolveItemSignal()`. Each test maps to a row in the
 * priority chain documented in `signal.js:108-156` (the public plugin's
 * v0.1.4 `renderItemSignal`).
 */

import resolveItemSignal from '../resolve-item-signal';
import type { AdminMenuSignal } from 'calypso/state/admin-menu/types';

const baseSignal: AdminMenuSignal = {
	count: null,
	numeric_badge: null,
	badge: null,
	inline_text: null,
	inline_icon: null,
	attention: false,
};

describe( 'resolveItemSignal()', () => {
	it( 'returns null for a null signal', () => {
		expect( resolveItemSignal( null ) ).toBeNull();
	} );

	it( 'returns null for an undefined signal', () => {
		expect( resolveItemSignal( undefined ) ).toBeNull();
	} );

	it( 'returns null when every renderable field is empty', () => {
		expect( resolveItemSignal( baseSignal ) ).toBeNull();
	} );

	it( 'priority 1: numeric_badge > 0 wins over count and badge', () => {
		const signal = {
			...baseSignal,
			numeric_badge: 5,
			count: 99,
			badge: 'fallback',
		};
		expect( resolveItemSignal( signal ) ).toEqual( {
			badgeText: '5',
			inlineText: null,
			inlineIcon: null,
			hasAny: true,
		} );
	} );

	it( 'priority 2: count > 0 wins when numeric_badge is null/zero', () => {
		// This is the issue-#39 fix path — without rendering count, the group's
		// aggregate dot fires but no child shows where the attention is.
		const signal = { ...baseSignal, count: 3, badge: 'fallback' };
		expect( resolveItemSignal( signal )?.badgeText ).toBe( '3' );
	} );

	it( 'priority 2: count works when numeric_badge is 0', () => {
		const signal = { ...baseSignal, count: 7, numeric_badge: 0 };
		expect( resolveItemSignal( signal )?.badgeText ).toBe( '7' );
	} );

	it( 'priority 3: badge string wins when numeric paths are absent', () => {
		const signal = { ...baseSignal, badge: '!' };
		expect( resolveItemSignal( signal )?.badgeText ).toBe( '!' );
	} );

	it( 'numeric_badge of 0 does not render as a badge', () => {
		// Mirrors public plugin: > 0 only.
		const signal = { ...baseSignal, numeric_badge: 0 };
		expect( resolveItemSignal( signal ) ).toBeNull();
	} );

	it( 'count of 0 does not render as a badge', () => {
		const signal = { ...baseSignal, count: 0 };
		expect( resolveItemSignal( signal ) ).toBeNull();
	} );

	it( 'negative count does not render as a badge', () => {
		const signal = { ...baseSignal, count: -3 };
		expect( resolveItemSignal( signal ) ).toBeNull();
	} );

	it( 'empty string badge does not render', () => {
		const signal = { ...baseSignal, badge: '' };
		expect( resolveItemSignal( signal ) ).toBeNull();
	} );

	it( 'inline_text is rendered as a side-channel even with no badge', () => {
		const signal = { ...baseSignal, inline_text: 'Premium' };
		expect( resolveItemSignal( signal ) ).toEqual( {
			badgeText: null,
			inlineText: 'Premium',
			inlineIcon: null,
			hasAny: true,
		} );
	} );

	it( 'inline_icon is rendered as a side-channel even with no badge', () => {
		const signal = { ...baseSignal, inline_icon: 'dashicons-warning' };
		expect( resolveItemSignal( signal )?.inlineIcon ).toBe( 'dashicons-warning' );
	} );

	it( 'returns numeric_badge AND inline_text together', () => {
		const signal = { ...baseSignal, numeric_badge: 2, inline_text: 'BETA' };
		const result = resolveItemSignal( signal );
		expect( result ).toEqual( {
			badgeText: '2',
			inlineText: 'BETA',
			inlineIcon: null,
			hasAny: true,
		} );
	} );

	it( 'returns count AND inline_icon together', () => {
		const signal = { ...baseSignal, count: 4, inline_icon: 'dashicons-warning' };
		const result = resolveItemSignal( signal );
		expect( result?.badgeText ).toBe( '4' );
		expect( result?.inlineIcon ).toBe( 'dashicons-warning' );
	} );

	it( 'inline_text alone does not enable attention but still renders', () => {
		// `inline_text` is decorative — does NOT contribute to attention per
		// the schema contract — but it IS rendered.
		const signal = { ...baseSignal, inline_text: 'BETA' };
		const result = resolveItemSignal( signal );
		expect( result?.inlineText ).toBe( 'BETA' );
		expect( result?.badgeText ).toBeNull();
	} );

	it( 'rejects non-numeric strings in numeric_badge field', () => {
		// `AdminMenuSignal` types `numeric_badge` as `number | null`, but a
		// permissive runtime check guards against payloads that drift from
		// the contract.
		const signal = {
			...baseSignal,
			numeric_badge: '5' as unknown as number,
		};
		expect( resolveItemSignal( signal ) ).toBeNull();
	} );

	it( 'big numbers render as a multi-digit pill', () => {
		const signal = { ...baseSignal, numeric_badge: 99 };
		expect( resolveItemSignal( signal )?.badgeText ).toBe( '99' );
	} );
} );
