import { ResponseCart } from '@automattic/shopping-cart';
import { LocalizeProps, localize } from 'i18n-calypso';
import { hasTitanMail } from 'calypso/lib/cart-values/cart-items';
import { getTitanProductName } from 'calypso/lib/titan';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';

function TitanTermsOfService( {
	cart,
	translate,
}: {
	cart: ResponseCart;
	translate: LocalizeProps[ 'translate' ];
} ) {
	if ( ! hasTitanMail( cart ) ) {
		return null;
	}

	const titanTerms = translate(
		"You understand that your %(productName)s service will be powered by Titan and is subject to Titan's {{titanCustomerTos}}Customer Terms of Service{{/titanCustomerTos}}, {{titanAup}}Acceptable Use Policy{{/titanAup}}, and {{titanPrivacy}}Privacy Policy{{/titanPrivacy}}.",
		{
			args: {
				productName: getTitanProductName(),
			},
			comment:
				'%(productName) is the name of the product, which should be "Professional Email" translated',
			components: {
				titanCustomerTos: (
					<a
						href="https://support.titan.email/hc/en-us/articles/360038024254-Titan-Customer-Terms-of-Use"
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				titanAup: (
					<a
						href="https://support.titan.email/hc/en-us/articles/900000775226-Titan-Acceptable-Use-Policy"
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				titanPrivacy: (
					<a
						href="https://support.titan.email/hc/en-us/articles/360038535773-Titan-Privacy-Policy"
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);

	return <CheckoutTermsItem>{ titanTerms }</CheckoutTermsItem>;
}

export default localize( TitanTermsOfService );
