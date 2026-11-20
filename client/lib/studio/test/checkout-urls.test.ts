import {
	isStudioCheckoutPath,
	isStudioCheckoutRedirect,
	STUDIO_DEFAULT_BACK_URL,
	STUDIO_WEB_HOSTS,
	STUDIO_WEB_ORIGINS,
	STUDIO_WEB_APP_URL,
} from '../checkout-urls';

describe( 'Studio checkout URLs', () => {
	test( 'lists the landing site and the web app as return hosts', () => {
		expect( STUDIO_WEB_HOSTS ).toEqual( [ 'wordpress.studio', 'app.wordpress.studio' ] );
		expect( STUDIO_WEB_ORIGINS ).toEqual( [
			'https://wordpress.studio',
			'https://app.wordpress.studio',
		] );
	} );

	test( 'sends back and close to the landing site, and Go to Studio to the web app', () => {
		expect( STUDIO_DEFAULT_BACK_URL ).toBe( 'https://wordpress.studio/' );
		expect( STUDIO_WEB_APP_URL ).toBe( 'https://app.wordpress.studio/' );
	} );
} );

describe( 'isStudioCheckoutPath', () => {
	test( 'is true under /checkout/studio/', () => {
		expect( isStudioCheckoutPath( '/checkout/studio/studio-cloud-monthly' ) ).toBe( true );
	} );

	test.each( [
		'/checkout/studio-return',
		'/checkout/studio',
		'/checkout/wpcom/studio-cloud-monthly',
		'/checkout/example.com/studio-cloud-monthly',
	] )( 'is false for %s', ( pathname ) => {
		expect( isStudioCheckoutPath( pathname ) ).toBe( false );
	} );
} );

describe( 'isStudioCheckoutRedirect', () => {
	test.each( [
		'/checkout/studio/studio-cloud-monthly',
		'/checkout/studio/studio-cloud-monthly?coupon=X',
		'https://wordpress.com/checkout/studio/studio-pro-yearly',
	] )( 'is true for %s', ( redirectTo ) => {
		expect( isStudioCheckoutRedirect( redirectTo ) ).toBe( true );
	} );

	test.each( [
		null,
		'',
		'/checkout/studio-return?studioSiteId=abc',
		'/checkout/wpcom/studio-cloud-monthly',
		'https://example.com/checkout/studio/studio-cloud-monthly',
	] )( 'is false for %s', ( redirectTo ) => {
		expect( isStudioCheckoutRedirect( redirectTo ) ).toBe( false );
	} );
} );
