import { getCancelButtonCopy, getRemoveButtonCopy } from '../get-cancel-remove-copy';

const DATE = 'January 1, 2027';

describe( 'getCancelButtonCopy (dashboard)', () => {
	test( 'plan — generic label, plan-features micro-copy', () => {
		const copy = getCancelButtonCopy( {
			category: 'plan',
			productName: 'WordPress.com Business',
			expiryDateFormatted: DATE,
		} );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep plan features until ${ DATE }.` );
	} );

	test( 'domain copy', () => {
		const copy = getCancelButtonCopy( {
			category: 'domain',
			productName: 'example.com',
			expiryDateFormatted: DATE,
		} );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep your domain until ${ DATE }.` );
	} );

	test( 'email copy', () => {
		const copy = getCancelButtonCopy( {
			category: 'email',
			productName: 'Google Workspace',
			expiryDateFormatted: DATE,
		} );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep your email until ${ DATE }.` );
	} );

	test( 'other uses product-name micro-copy', () => {
		const copy = getCancelButtonCopy( {
			category: 'other',
			productName: 'Jetpack Stats',
			expiryDateFormatted: DATE,
		} );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep Jetpack Stats until ${ DATE }.` );
	} );

	test( 'marketplace_plugin uses product-name micro-copy', () => {
		const copy = getCancelButtonCopy( {
			category: 'marketplace_plugin',
			productName: 'WPBakery Page Builder',
			expiryDateFormatted: DATE,
		} );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe(
			`Stop future payments. Keep WPBakery Page Builder until ${ DATE }.`
		);
	} );

	test( 'marketplace_theme uses product-name micro-copy', () => {
		const copy = getCancelButtonCopy( {
			category: 'marketplace_theme',
			productName: 'Divi',
			expiryDateFormatted: DATE,
		} );
		expect( copy.label ).toBe( 'Cancel subscription' );
		expect( copy.description ).toBe( `Stop future payments. Keep Divi until ${ DATE }.` );
	} );
} );

describe( 'getRemoveButtonCopy (dashboard)', () => {
	test( 'plan with refund — product-aware label, refund description', () => {
		const copy = getRemoveButtonCopy( {
			category: 'plan',
			productName: 'WordPress.com Business',
			hasRefund: true,
		} );
		expect( copy.label ).toBe( 'Remove plan' );
		expect( copy.description ).toBe( 'Get a refund and remove plan features immediately.' );
	} );

	test( 'plan, no refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'plan',
			productName: 'WordPress.com Business',
			hasRefund: false,
		} );
		expect( copy.label ).toBe( 'Remove plan' );
		expect( copy.description ).toBe( 'Plan features will be removed immediately.' );
	} );

	test( 'domain with refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'domain',
			productName: 'example.com',
			hasRefund: true,
		} );
		expect( copy.label ).toBe( 'Remove domain' );
		expect( copy.description ).toBe( 'Get a refund and remove your domain immediately.' );
	} );

	test( 'domain, no refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'domain',
			productName: 'example.com',
			hasRefund: false,
		} );
		expect( copy.label ).toBe( 'Remove domain' );
		expect( copy.description ).toBe( 'Domain will be removed immediately.' );
	} );

	test( 'email with refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'email',
			productName: 'Google Workspace',
			hasRefund: true,
		} );
		expect( copy.label ).toBe( 'Remove email' );
		expect( copy.description ).toBe( 'Get a refund and remove your email immediately.' );
	} );

	test( 'email, no refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'email',
			productName: 'Google Workspace',
			hasRefund: false,
		} );
		expect( copy.label ).toBe( 'Remove email' );
		expect( copy.description ).toBe( 'Email will be removed immediately.' );
	} );

	test( 'other with refund — label and description both product-aware', () => {
		const copy = getRemoveButtonCopy( {
			category: 'other',
			productName: 'Jetpack Stats',
			hasRefund: true,
		} );
		expect( copy.label ).toBe( 'Remove Jetpack Stats' );
		expect( copy.description ).toBe( 'Get a refund and remove Jetpack Stats immediately.' );
	} );

	test( 'other, no refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'other',
			productName: 'Akismet Pro 500',
			hasRefund: false,
		} );
		expect( copy.label ).toBe( 'Remove Akismet Pro 500' );
		expect( copy.description ).toBe( 'Akismet Pro 500 will be removed immediately.' );
	} );

	test( 'marketplace_plugin, no refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'marketplace_plugin',
			productName: 'WPBakery Page Builder',
			hasRefund: false,
		} );
		expect( copy.label ).toBe( 'Remove plugin' );
		expect( copy.description ).toBe( 'WPBakery Page Builder will be removed immediately.' );
	} );

	test( 'marketplace_plugin with refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'marketplace_plugin',
			productName: 'WPBakery Page Builder',
			hasRefund: true,
		} );
		expect( copy.label ).toBe( 'Remove plugin' );
		expect( copy.description ).toBe( 'Get a refund and remove WPBakery Page Builder immediately.' );
	} );

	test( 'marketplace_theme, no refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'marketplace_theme',
			productName: 'Divi',
			hasRefund: false,
		} );
		expect( copy.label ).toBe( 'Remove theme' );
		expect( copy.description ).toBe( 'Divi will be removed immediately.' );
	} );

	test( 'marketplace_theme with refund', () => {
		const copy = getRemoveButtonCopy( {
			category: 'marketplace_theme',
			productName: 'Divi',
			hasRefund: true,
		} );
		expect( copy.label ).toBe( 'Remove theme' );
		expect( copy.description ).toBe( 'Get a refund and remove Divi immediately.' );
	} );
} );
