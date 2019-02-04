/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { REFUNDS } from 'lib/url/support';
import Gridicon from 'gridicons';
import { cartItems } from 'lib/cart-values';

class DomainRegistrationRefundPolicy extends React.Component {
	static displayName = 'RegistrationRefundPolicy';

	recordRefundsSupportClick = () => {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Refund Support Link' );
	};

	renderPolicy = () => {
		let message = this.props.translate(
			'{{refundsSupportPage}}Domain name refunds{{/refundsSupportPage}} are limited to 48 hours after registration.',
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

		if ( cartItems.hasDomainBeingUsedForPlan( this.props.cart ) ) {
			message = this.props.translate(
				'{{refundsSupportPage}}Domain name refunds{{/refundsSupportPage}} are limited to 48 hours after registration. Refunds of paid plans will deduct the standard cost of any domain name registered within a plan.',
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
		}

		return message;
	};

	render() {
		if ( ! cartItems.hasDomainRegistration( this.props.cart ) ) {
			return null;
		}

		return (
			<div className="checkout__domain-refund-policy">
				<Gridicon icon="info-outline" size={ 18 } />
				<p>{ this.renderPolicy() }</p>
			</div>
		);
	}
}

export default localize( DomainRegistrationRefundPolicy );
