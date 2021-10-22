import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import {
	MANAGE_PURCHASES_AUTOMATIC_RENEWAL,
	MANAGE_PURCHASES_FAQ_CANCELLING,
} from 'calypso/lib/url/support';
import TosText from 'calypso/me/purchases/manage-purchase/payment-method-selector/tos-text';

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
