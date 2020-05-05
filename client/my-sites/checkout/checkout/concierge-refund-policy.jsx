/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import { REFUNDS } from 'lib/url/support';
import Gridicon from 'components/gridicon';
import { hasConciergeSession } from 'lib/cart-values/cart-items';

class ConciergeRefundPolicy extends React.Component {
	static displayName = 'RegistrationRefundPolicy';

	recordRefundsSupportClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Refund Support Link' );
	};

	renderPolicy = () => {
		const message = this.props.translate(
			'You understand that {{refundsSupportPage}}Quick Start Session refunds{{/refundsSupportPage}} are limited to 30 days from the date of purchase.',
			{
				components: {
					refundsSupportPage: (
						<a
							href={ REFUNDS }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ this.recordRefundsSupportClick }
						/>
					),
				},
			}
		);

		return message;
	};

	render() {
		if ( ! hasConciergeSession( this.props.cart ) ) {
			return null;
		}

		return (
			<div className="checkout__concierge-refund-policy">
				<Gridicon icon="info-outline" size={ 18 } />
				<p>{ this.renderPolicy() }</p>
			</div>
		);
	}
}

export default localize( ConciergeRefundPolicy );
