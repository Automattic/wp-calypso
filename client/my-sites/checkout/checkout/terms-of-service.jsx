/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import {
	MANAGE_PURCHASES_AUTOMATIC_RENEWAL,
	MANAGE_PURCHASES_FAQ_CANCELLING,
} from 'lib/url/support';
import Gridicon from 'components/gridicon';
import { localizeUrl } from 'lib/i18n-utils';

class TermsOfService extends React.Component {
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
			message = this.props.translate(
				'You agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
				{
					components: {
						tosLink: (
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						autoRenewalSupportPage: (
							<a
								href={ MANAGE_PURCHASES_AUTOMATIC_RENEWAL }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						faqCancellingSupportPage: (
							<a
								href={ MANAGE_PURCHASES_FAQ_CANCELLING }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		}

		return message;
	}

	render() {
		return (
			<div
				className="checkout__terms"
				role="presentation"
				onClick={ this.recordTermsAndConditionsClick }
			>
				<Gridicon icon="info-outline" size={ 18 } />
				<p>{ this.renderTerms() }</p>
			</div>
		);
	}
}

export default localize( TermsOfService );
