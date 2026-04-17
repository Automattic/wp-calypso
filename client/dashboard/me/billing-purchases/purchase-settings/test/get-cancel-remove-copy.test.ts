/**
 * @jest-environment node
 */
jest.mock( '@wordpress/i18n', () => {
	const format = ( tpl: string, args?: Record< string, string | number > ) => {
		if ( ! args ) {
			return tpl;
		}
		return tpl.replace( /%\((\w+)\)[sd]/g, ( _, key ) => String( args[ key ] ?? '' ) );
	};
	return {
		__: ( text: string ) => text,
		sprintf: ( tpl: string, args: Record< string, string | number > ) => format( tpl, args ),
	};
} );

import {
	getCancelButtonCopy,
	getRemoveButtonCopy,
	isDomainTransfer,
} from '../get-cancel-remove-copy';
import type { Purchase } from '@automattic/api-core';

const DATE = 'January 1, 2027';

function make( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		is_plan: false,
		is_domain_registration: false,
		is_domain: false,
		is_jetpack_plan_or_product: false,
		product_name: 'Generic Product',
		product_slug: 'some_product',
		...overrides,
	} as Purchase;
}

describe( 'getCancelButtonCopy', () => {
	test( 'plan — generic label, plan-features micro-copy', () => {
		const copy = getCancelButtonCopy( make( { is_plan: true } ), DATE );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep plan features until ${ DATE }.` );
	} );

	test( 'domain registration copy', () => {
		const copy = getCancelButtonCopy( make( { is_domain_registration: true } ), DATE );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toContain( 'Keep your domain until' );
	} );

	test( 'domain transfer is treated as domain', () => {
		const copy = getCancelButtonCopy( make( { product_slug: 'domain_transfer' } ), DATE );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toContain( 'Keep your domain until' );
	} );

	test( 'Google Workspace email copy', () => {
		const copy = getCancelButtonCopy(
			make( { product_slug: 'wp_google_workspace_business_starter_monthly' } ),
			DATE
		);
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toContain( 'Keep your email until' );
	} );

	test( 'Titan Mail email copy', () => {
		const copy = getCancelButtonCopy( make( { product_slug: 'wp_titan_mail_monthly' } ), DATE );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toContain( 'Keep your email until' );
	} );

	test( 'Jetpack / other uses product name in micro-copy', () => {
		const copy = getCancelButtonCopy(
			make( { product_slug: 'jetpack_stats_yearly', product_name: 'Jetpack Stats' } ),
			DATE
		);
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep Jetpack Stats until ${ DATE }.` );
	} );
} );

describe( 'getRemoveButtonCopy', () => {
	test( 'plan with refund, auto-renew on (dual-button) — generic subscription label', () => {
		const copy = getRemoveButtonCopy( make( { is_plan: true } ), true, true );
		expect( copy.label ).toBe( 'Remove subscription' );
		expect( copy.description ).toBe( 'Get a refund and remove plan features immediately.' );
	} );

	test( 'plan, auto-renew off — product-specific label', () => {
		const copy = getRemoveButtonCopy( make( { is_plan: true } ), false, false );
		expect( copy.label ).toBe( 'Remove plan' );
		expect( copy.description ).toBe( 'Plan features will be removed immediately.' );
	} );

	test( 'domain with refund, auto-renew on', () => {
		const copy = getRemoveButtonCopy( make( { is_domain_registration: true } ), true, true );
		expect( copy.label ).toBe( 'Remove subscription' );
		expect( copy.description ).toContain( 'Get a refund' );
		expect( copy.description ).toContain( 'your domain' );
	} );

	test( 'domain, auto-renew off', () => {
		const copy = getRemoveButtonCopy( make( { is_domain_registration: true } ), false, false );
		expect( copy.label ).toBe( 'Remove domain' );
		expect( copy.description ).toBe( 'Domain will be removed immediately.' );
	} );

	test( 'email, auto-renew off', () => {
		const copy = getRemoveButtonCopy(
			make( { product_slug: 'wp_google_workspace_business_starter_monthly' } ),
			false,
			false
		);
		expect( copy.label ).toBe( 'Remove email' );
		expect( copy.description ).toBe( 'Email will be removed immediately.' );
	} );

	test( 'Jetpack product: label uses product name when auto-renew off, generic when on', () => {
		const purchase = make( {
			product_slug: 'jetpack_stats_yearly',
			product_name: 'Jetpack Stats',
		} );
		const dualButton = getRemoveButtonCopy( purchase, true, true );
		expect( dualButton.label ).toBe( 'Remove subscription' );
		expect( dualButton.description ).toBe( 'Get a refund and remove Jetpack Stats immediately.' );

		const afterCancel = getRemoveButtonCopy( purchase, false, false );
		expect( afterCancel.label ).toBe( 'Remove Jetpack Stats' );
		expect( afterCancel.description ).toBe( 'Jetpack Stats will be removed immediately.' );
	} );

	test( 'Akismet product: product name on both axes when auto-renew off', () => {
		const purchase = make( {
			product_slug: 'ak_pro5h_yearly',
			product_name: 'Akismet Pro 500',
		} );
		const copy = getRemoveButtonCopy( purchase, false, false );
		expect( copy.label ).toBe( 'Remove Akismet Pro 500' );
		expect( copy.description ).toBe( 'Akismet Pro 500 will be removed immediately.' );
	} );
} );

describe( 'isDomainTransfer', () => {
	test( 'true for domain_transfer slug', () => {
		expect( isDomainTransfer( { product_slug: 'domain_transfer' } ) ).toBe( true );
	} );

	test( 'false for other slugs', () => {
		expect( isDomainTransfer( { product_slug: 'value_bundle' } ) ).toBe( false );
		expect( isDomainTransfer( { product_slug: 'dotlive_domain' } ) ).toBe( false );
	} );
} );
