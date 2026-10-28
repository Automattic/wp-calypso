import page from '@automattic/calypso-router';
import getUpsellProps from '../get-upsell-props';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

describe( 'getUpsellProps', () => {
	it( 'keeps Skip available for an ordinary domain upsell', () => {
		const props = getUpsellProps( { isDomainInCart: true, siteSlug: 'example.wordpress.com' } );

		expect( props.showCancelButton ).toBe( true );
		props.onCancel?.();
		expect( page ).toHaveBeenCalledWith( '/checkout/example.wordpress.com' );
	} );

	it( 'does not offer Skip when the user is purchasing email', () => {
		expect(
			getUpsellProps( {
				isDomainInCart: true,
				siteSlug: 'example.wordpress.com',
				canSkip: false,
			} )
		).toEqual( {} );
	} );

	it( 'does not add an upsell cancel action when there is no domain in the cart', () => {
		expect(
			getUpsellProps( { isDomainInCart: false, siteSlug: 'example.wordpress.com' } )
		).toEqual( {} );
	} );
} );
