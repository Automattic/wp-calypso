/**
 * @jest-environment node
 */
import { getCancelButtonCopy, getRemoveButtonCopy } from '../get-cancel-remove-copy';
import type { Purchase } from 'calypso/lib/purchases/types';

const DATE = 'January 1, 2027';

// A minimal i18n-calypso `translate` shim that formats %(name)s placeholders.
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

function make( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		productName: 'Generic Product',
		productSlug: 'some_product',
		...overrides,
	} as Purchase;
}

describe( 'classic getCancelButtonCopy', () => {
	test( 'plan — generic label, plan-features micro-copy', () => {
		const copy = getCancelButtonCopy( make( { productSlug: 'value_bundle' } ), DATE, t );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep plan features until ${ DATE }.` );
	} );

	test( 'domain registration copy', () => {
		const copy = getCancelButtonCopy(
			make( { productSlug: 'dotlive_domain', isDomainRegistration: true } ),
			DATE,
			t
		);
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toContain( 'Keep your domain until' );
	} );

	test( 'domain transfer is treated as domain', () => {
		const copy = getCancelButtonCopy( make( { productSlug: 'domain_transfer' } ), DATE, t );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toContain( 'Keep your domain until' );
	} );

	test( 'Google Workspace email copy', () => {
		const copy = getCancelButtonCopy( make( { productSlug: 'gapps' } ), DATE, t );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toContain( 'Keep your email until' );
	} );

	test( 'Jetpack / other uses product name in micro-copy', () => {
		const copy = getCancelButtonCopy(
			make( { productSlug: 'jetpack_stats_yearly', productName: 'Jetpack Stats' } ),
			DATE,
			t
		);
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep Jetpack Stats until ${ DATE }.` );
	} );
} );

describe( 'classic getRemoveButtonCopy', () => {
	test( 'plan with refund, auto-renew on (dual-button) — generic subscription label', () => {
		const copy = getRemoveButtonCopy( make( { productSlug: 'value_bundle' } ), true, true, t );
		expect( copy.label ).toBe( 'Remove subscription' );
		expect( copy.description ).toBe( 'Get a refund and remove plan features immediately.' );
	} );

	test( 'plan, auto-renew off — product-specific label', () => {
		const copy = getRemoveButtonCopy( make( { productSlug: 'value_bundle' } ), false, false, t );
		expect( copy.label ).toBe( 'Remove plan' );
		expect( copy.description ).toBe( 'Plan features will be removed immediately.' );
	} );

	test( 'domain with refund, auto-renew on', () => {
		const copy = getRemoveButtonCopy(
			make( { productSlug: 'dotlive_domain', isDomainRegistration: true } ),
			true,
			true,
			t
		);
		expect( copy.label ).toBe( 'Remove subscription' );
		expect( copy.description ).toContain( 'Get a refund' );
		expect( copy.description ).toContain( 'your domain' );
	} );

	test( 'domain, auto-renew off', () => {
		const copy = getRemoveButtonCopy(
			make( { productSlug: 'dotlive_domain', isDomainRegistration: true } ),
			false,
			false,
			t
		);
		expect( copy.label ).toBe( 'Remove domain' );
		expect( copy.description ).toBe( 'Domain will be removed immediately.' );
	} );

	test( 'email, auto-renew off', () => {
		const copy = getRemoveButtonCopy( make( { productSlug: 'gapps' } ), false, false, t );
		expect( copy.label ).toBe( 'Remove email' );
		expect( copy.description ).toBe( 'Email will be removed immediately.' );
	} );

	test( 'Jetpack product: label uses product name when auto-renew off, generic when on', () => {
		const purchase = make( {
			productSlug: 'jetpack_stats_yearly',
			productName: 'Jetpack Stats',
		} );
		const dualButton = getRemoveButtonCopy( purchase, true, true, t );
		expect( dualButton.label ).toBe( 'Remove subscription' );
		expect( dualButton.description ).toBe( 'Get a refund and remove Jetpack Stats immediately.' );

		const afterCancel = getRemoveButtonCopy( purchase, false, false, t );
		expect( afterCancel.label ).toBe( 'Remove Jetpack Stats' );
		expect( afterCancel.description ).toBe( 'Jetpack Stats will be removed immediately.' );
	} );

	test( 'Akismet product: product name on both axes when auto-renew off', () => {
		const purchase = make( {
			productSlug: 'ak_pro5h_yearly',
			productName: 'Akismet Pro 500',
		} );
		const copy = getRemoveButtonCopy( purchase, false, false, t );
		expect( copy.label ).toBe( 'Remove Akismet Pro 500' );
		expect( copy.description ).toBe( 'Akismet Pro 500 will be removed immediately.' );
	} );
} );
