import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import TosText from 'calypso/me/purchases/manage-purchase/payment-method-selector/tos-text';
import CheckoutTermsItem from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms-item';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class TermsOfService extends Component {
	static displayName = 'TermsOfService';

	recordTermsAndConditionsClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Terms and Conditions Link' );
	};

	renderTerms() {
		let message = this.props.translate( 'You agree to our {{link}}Terms of Service{{/link}}.', {
			components: {
				link: (
					<a
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		} );

		// Need to add check for subscription products in the cart so we don't show this for one-off purchases like themes
		if ( this.props.hasRenewableSubscription ) {
			message = <TosText />;
		}

		return message;
	}

	render() {
		return (
			<CheckoutTermsItem onClick={ this.recordTermsAndConditionsClick }>
				{ this.renderTerms() }
			</CheckoutTermsItem>
		);
	}
}

export default localize( TermsOfService );
