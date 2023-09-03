import { localize } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';

/* eslint-disable wpcalypso/jsx-classname-namespace */

function ThirdPartyPluginsTermsOfService( { cart, translate } ) {
	const hasMarketplaceProduct = useSelector( ( state ) => {
		return cart?.products?.some( ( p ) => isMarketplaceProduct( state, p.product_slug ) );
	} );

	if ( ! hasMarketplaceProduct ) {
		return null;
	}

	const thirdPartyPluginsTerms = translate(
		'You agree to our {{thirdPartyToS}}Third-Party Plugins Terms of Service{{/thirdPartyToS}}',
		{
			components: {
				thirdPartyToS: (
					<a
						href="https://wordpress.com/third-party-plugins-terms/"
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);

	return <CheckoutTermsItem>{ thirdPartyPluginsTerms }</CheckoutTermsItem>;
}

export default localize( ThirdPartyPluginsTermsOfService );
