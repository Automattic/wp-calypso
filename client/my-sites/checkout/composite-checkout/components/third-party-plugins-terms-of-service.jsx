import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { useSelector } from 'react-redux';
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
						href="https://wordpress.com/marketplace-third-party-plugins-terms"
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);

	return (
		<div className="checkout__terms">
			<Gridicon icon="info-outline" size={ 18 } />
			<p>{ thirdPartyPluginsTerms }</p>
		</div>
	);
}

export default localize( ThirdPartyPluginsTermsOfService );
