import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const hasThirdPartyToS = () => true;

function ThirdPartyPluginsTermsOfService( { cart, translate } ) {
	if ( ! hasThirdPartyToS( cart ) ) {
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
