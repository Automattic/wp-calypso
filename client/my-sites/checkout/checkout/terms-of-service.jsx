/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'client/lib/analytics';
import support from 'client/lib/url/support';
import Gridicon from 'gridicons';

class TermsOfService extends React.Component {
	static displayName = 'TermsOfService';

	recordTermsAndConditionsClick = () => {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Terms and Conditions Link' );
	};

	renderTerms = () => {
		var message = this.props.translate(
			'By checking out, you agree to our {{link}}fascinating terms and conditions{{/link}}.',
			{
				components: {
					link: <a href="//wordpress.com/tos/" target="_blank" rel="noopener noreferrer" />,
				},
			}
		);

		// Need to add check for subscription products in the cart so we don't show this for one-off purchases like themes
		if ( this.props.hasRenewableSubscription ) {
			message = this.props.translate(
				'By checking out, you agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{managePurchasesSupportPage}}how to cancel{{/managePurchasesSupportPage}}.',
				{
					components: {
						tosLink: <a href="//wordpress.com/tos/" target="_blank" rel="noopener noreferrer" />,
						autoRenewalSupportPage: (
							<a href={ support.AUTO_RENEWAL } target="_blank" rel="noopener noreferrer" />
						),
						managePurchasesSupportPage: (
							<a href={ support.MANAGE_PURCHASES } target="_blank" rel="noopener noreferrer" />
						),
					},
				}
			);
		}

		return message;
	};

	render() {
		return (
			<div className="checkout-terms" onClick={ this.recordTermsAndConditionsClick }>
				<Gridicon icon="info-outline" size={ 18 } />
				<p>{ this.renderTerms() }</p>
			</div>
		);
	}
}

export default localize( TermsOfService );
