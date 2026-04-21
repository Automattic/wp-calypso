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
import {
	getCancelButtonCopy as dashboardGetCancelButtonCopy,
	getRemoveButtonCopy as dashboardGetRemoveButtonCopy,
} from '../../../../dashboard/me/billing-purchases/purchase-settings/get-cancel-remove-copy';
import {
	getCancelButtonCopy as legacyGetCancelButtonCopy,
	getRemoveButtonCopy as legacyGetRemoveButtonCopy,
} from '../get-cancel-remove-copy';
import type { CancelRemoveCategory } from '@automattic/api-core';

const DATE = 'January 1, 2027';
const PRODUCT_NAMES: Record< CancelRemoveCategory, string > = {
	plan: 'WordPress.com Business',
	domain: 'example.com',
	email: 'Google Workspace',
	other: 'Jetpack Stats',
};

// A minimal i18n-calypso `translate` shim that formats %(name)s
// placeholders. Matches the shape of `@wordpress/i18n`'s `__` + `sprintf`
// output when no translations are loaded, so copy produced by the two
// surfaces can be compared byte-for-byte.
function translate( tpl: string, options?: { args?: Record< string, string | number > } ): string {
	const args = options?.args;
	if ( ! args ) {
		return tpl;
	}
	return tpl.replace( /%\((\w+)\)[sd]/g, ( _, key ) => String( args[ key ] ?? '' ) );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const t = translate as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

const CATEGORIES: CancelRemoveCategory[] = [ 'plan', 'domain', 'email', 'other' ];

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
