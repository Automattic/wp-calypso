/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { hasTitanMail } from 'calypso/lib/cart-values/cart-items';
import Gridicon from 'calypso/components/gridicon';

/* eslint-disable wpcalypso/jsx-classname-namespace */

function TitanTermsOfService( { cart, translate } ) {
	if ( ! hasTitanMail( cart ) ) {
		return null;
	}

	const titanTerms = translate(
		"You understand that your Email service will be powered by Titan and is subject to Titan's {{titanCustomerTos}}Customer Terms of Service{{/titanCustomerTos}}, {{titanAup}}Acceptable Use Policy{{/titanAup}}, and {{titanPrivacy}}Privacy Policy{{/titanPrivacy}}.",
		{
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

	return (
		<div className="checkout__titan-terms-of-service">
			<Gridicon icon="info-outline" size={ 18 } />
			<p>{ titanTerms }</p>
		</div>
	);
}

export default localize( TitanTermsOfService );
