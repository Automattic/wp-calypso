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

	test( 'Jetpack / other uses subscription label and product-name micro-copy', () => {
		const copy = getCancelButtonCopy(
			make( { product_slug: 'jetpack_stats_yearly', product_name: 'Jetpack Stats' } ),
			DATE
		);
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep Jetpack Stats until ${ DATE }.` );
	} );
} );

describe( 'getRemoveButtonCopy', () => {
	test( 'plan with refund — product-aware label, refund description', () => {
		const copy = getRemoveButtonCopy( make( { is_plan: true } ), true );
		expect( copy.label ).toBe( 'Remove plan' );
		expect( copy.description ).toBe( 'Get a refund and remove plan features immediately.' );
	} );

	test( 'plan, no refund — product-aware label', () => {
		const copy = getRemoveButtonCopy( make( { is_plan: true } ), false );
		expect( copy.label ).toBe( 'Remove plan' );
		expect( copy.description ).toBe( 'Plan features will be removed immediately.' );
	} );

	test( 'domain with refund', () => {
		const copy = getRemoveButtonCopy( make( { is_domain_registration: true } ), true );
		expect( copy.label ).toBe( 'Remove domain' );
		expect( copy.description ).toContain( 'Get a refund' );
		expect( copy.description ).toContain( 'your domain' );
	} );

	test( 'domain, no refund', () => {
		const copy = getRemoveButtonCopy( make( { is_domain_registration: true } ), false );
		expect( copy.label ).toBe( 'Remove domain' );
		expect( copy.description ).toBe( 'Domain will be removed immediately.' );
	} );

	test( 'email', () => {
		const copy = getRemoveButtonCopy(
			make( { product_slug: 'wp_google_workspace_business_starter_monthly' } ),
			false
		);
		expect( copy.label ).toBe( 'Remove email' );
		expect( copy.description ).toBe( 'Email will be removed immediately.' );
	} );

	test( 'Jetpack product: label uses product name', () => {
		const purchase = make( {
			product_slug: 'jetpack_stats_yearly',
			product_name: 'Jetpack Stats',
		} );
		const withRefund = getRemoveButtonCopy( purchase, true );
		expect( withRefund.label ).toBe( 'Remove Jetpack Stats' );
		expect( withRefund.description ).toBe( 'Get a refund and remove Jetpack Stats immediately.' );

		const noRefund = getRemoveButtonCopy( purchase, false );
		expect( noRefund.label ).toBe( 'Remove Jetpack Stats' );
		expect( noRefund.description ).toBe( 'Jetpack Stats will be removed immediately.' );
	} );

	test( 'Akismet product: product name on both axes', () => {
		const purchase = make( {
			product_slug: 'ak_pro5h_yearly',
			product_name: 'Akismet Pro 500',
		} );
		const copy = getRemoveButtonCopy( purchase, false );
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
