import { getAuthCopy, getLoginCopy, getRegistrationAcknowledgement, getSignupCopy } from '../copy';

describe( 'getRegistrationAcknowledgement', () => {
	test( 'uses store wording when any Woo-family plugin is active', () => {
		expect( getRegistrationAcknowledgement( [ 'woocommerce' ] ) ).toBe(
			'Your store is registered with WordPress.com.'
		);
		expect( getRegistrationAcknowledgement( [ 'woocommerce-payments' ] ) ).toBe(
			'Your store is registered with WordPress.com.'
		);
		expect( getRegistrationAcknowledgement( [ 'jetpack', 'woocommerce' ] ) ).toBe(
			'Your store is registered with WordPress.com.'
		);
	} );

	test( 'uses site wording for non-Woo plugin sets', () => {
		expect( getRegistrationAcknowledgement( [] ) ).toBe(
			'Your site is registered with WordPress.com.'
		);
		expect( getRegistrationAcknowledgement( [ 'jetpack' ] ) ).toBe(
			'Your site is registered with WordPress.com.'
		);
		expect( getRegistrationAcknowledgement( [ 'automattic-for-agencies-client' ] ) ).toBe(
			'Your site is registered with WordPress.com.'
		);
		expect( getRegistrationAcknowledgement( [ 'jetpack-boost', 'unknown' ] ) ).toBe(
			'Your site is registered with WordPress.com.'
		);
	} );
} );

describe( 'getAuthCopy', () => {
	test( 'returns the static "Connect your account" title regardless of plugins', () => {
		expect( getAuthCopy( [] ).title ).toBe( 'Connect your account' );
		expect( getAuthCopy( [ 'woocommerce' ] ).title ).toBe( 'Connect your account' );
		expect( getAuthCopy( [ 'jetpack', 'automattic-for-agencies-client' ] ).title ).toBe(
			'Connect your account'
		);
	} );

	test( 'subtitle reflects site/store branching', () => {
		expect( getAuthCopy( [ 'jetpack' ] ).subtitle ).toBe(
			'Your site is registered with WordPress.com.'
		);
		expect( getAuthCopy( [ 'woocommerce' ] ).subtitle ).toBe(
			'Your store is registered with WordPress.com.'
		);
	} );

	test( 'works with the default empty argument', () => {
		expect( getAuthCopy() ).toEqual( {
			title: 'Connect your account',
			subtitle: 'Your site is registered with WordPress.com.',
		} );
	} );
} );

describe( 'getSignupCopy', () => {
	test( 'mirrors getAuthCopy in PR 2', () => {
		expect( getSignupCopy( [ 'jetpack' ] ) ).toEqual( getAuthCopy( [ 'jetpack' ] ) );
		expect( getSignupCopy( [ 'woocommerce' ] ) ).toEqual( getAuthCopy( [ 'woocommerce' ] ) );
	} );
} );

describe( 'getLoginCopy', () => {
	test( 'returns the static "Log in to WordPress.com" title regardless of plugins', () => {
		expect( getLoginCopy( [] ).title ).toBe( 'Log in to WordPress.com' );
		expect( getLoginCopy( [ 'woocommerce' ] ).title ).toBe( 'Log in to WordPress.com' );
		expect( getLoginCopy( [ 'jetpack', 'automattic-for-agencies-client' ] ).title ).toBe(
			'Log in to WordPress.com'
		);
	} );

	test( 'subtitle reflects site/store branching', () => {
		expect( getLoginCopy( [ 'jetpack' ] ).subtitle ).toBe(
			'Your site is registered with WordPress.com.'
		);
		expect( getLoginCopy( [ 'woocommerce' ] ).subtitle ).toBe(
			'Your store is registered with WordPress.com.'
		);
	} );
} );
