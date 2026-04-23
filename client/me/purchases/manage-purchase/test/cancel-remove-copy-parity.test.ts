/**
 * @jest-environment node
 *
 * Cross-surface parity test for Cancel/Remove button copy.
 *
 * The two copy helpers — one for the dashboard, one for legacy — are
 * required to stay in lockstep because they produce the same English
 * strings via different i18n libraries. This test fails the moment the
 * two drift.
 *
 * If you change a string in one helper, change it in the other.
 */
import { sprintf } from '@wordpress/i18n';
import {
	getCancelButtonCopy as dashboardGetCancelButtonCopy,
	getRemoveButtonCopy as dashboardGetRemoveButtonCopy,
} from 'calypso/dashboard/me/billing-purchases/purchase-settings/get-cancel-remove-copy';
import {
	getCancelButtonCopy as legacyGetCancelButtonCopy,
	getRemoveButtonCopy as legacyGetRemoveButtonCopy,
} from '../get-cancel-remove-copy';
import type { CancelRemoveCategory } from '../classify-purchase-for-copy';

const DATE = 'January 1, 2027';
const PRODUCT_NAMES: Record< CancelRemoveCategory, string > = {
	plan: 'WordPress.com Business',
	domain: 'example.com',
	email: 'Google Workspace',
	marketplace_plugin: 'WPBakery Page Builder',
	marketplace_theme: 'Divi',
	other: 'Jetpack Stats',
};

// Drive the legacy `translate` parameter with @wordpress/i18n's sprintf so
// both sides of the comparison go through the same interpolation engine.
// What this test verifies is that both helpers use identical template strings
// — not that the two i18n libraries render identically.
/* eslint-disable @typescript-eslint/no-explicit-any */
const t = ( ( tpl: string, options?: { args?: Record< string, string | number > } ) =>
	options?.args ? sprintf( tpl, options.args ) : tpl ) as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

const CATEGORIES: CancelRemoveCategory[] = [
	'plan',
	'domain',
	'email',
	'marketplace_plugin',
	'marketplace_theme',
	'other',
];

describe( 'Cancel/Remove copy parity across dashboard + legacy', () => {
	describe.each( CATEGORIES )( 'getCancelButtonCopy (%s)', ( category ) => {
		const productName = PRODUCT_NAMES[ category ];
		const dashboard = dashboardGetCancelButtonCopy( {
			category,
			productName,
			expiryDateFormatted: DATE,
		} );
		const legacy = legacyGetCancelButtonCopy( {
			category,
			productName,
			expiryDateFormatted: DATE,
			translate: t,
		} );

		test( 'labels match', () => {
			expect( legacy.label ).toBe( dashboard.label );
		} );
		test( 'descriptions match', () => {
			expect( legacy.description ).toBe( dashboard.description );
		} );
	} );

	describe.each( CATEGORIES )( 'getRemoveButtonCopy (%s)', ( category ) => {
		const productName = PRODUCT_NAMES[ category ];

		describe.each( [ true, false ] )( 'hasRefund=%s', ( hasRefund ) => {
			const dashboard = dashboardGetRemoveButtonCopy( {
				category,
				productName,
				hasRefund,
			} );
			const legacy = legacyGetRemoveButtonCopy( {
				category,
				productName,
				hasRefund,
				translate: t,
			} );

			test( 'labels match', () => {
				expect( legacy.label ).toBe( dashboard.label );
			} );
			test( 'descriptions match', () => {
				expect( legacy.description ).toBe( dashboard.description );
			} );
		} );
	} );
} );
