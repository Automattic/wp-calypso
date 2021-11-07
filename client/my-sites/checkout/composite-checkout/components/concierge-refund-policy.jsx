import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { hasConciergeSession } from 'calypso/lib/cart-values/cart-items';
import { REFUNDS } from 'calypso/lib/url/support';

/* eslint-disable wpcalypso/jsx-classname-namespace */

class ConciergeRefundPolicy extends Component {
	static displayName = 'RegistrationRefundPolicy';

	recordRefundsSupportClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Refund Support Link' );
	};

	renderPolicy = () => {
		const message = this.props.translate(
			'You understand that {{refundsSupportPage}}Quick Start Session refunds{{/refundsSupportPage}} are limited to %(days)d days from the date of purchase.',
			{
				args: { days: 14 },
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
