/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import FormCheckbox from 'components/forms/form-checkbox';
import PaymentLogo from 'components/payment-logo';

class ShippingCard extends Component {
	render() {
		const { type, digits, name, date } = this.props;
		const __ = i18n.translate;

		return (
			<CompactCard className="shipping__card">
				<FormCheckbox
					className="shipping__card-checkbox"
				/>
				<div className="shipping__card-info">
					<PaymentLogo className="shipping__card-logo" type={ type.toLowerCase() } />
					<div className="shipping__card-details">
						<p className="shipping__card-number">{ type } ****{ digits }</p>
						<p className="shipping__card-name">{ name }</p>
					</div>
					<div className="shipping__card-date">{ __( 'Expires %(date)s', { args: { date } } ) }</div>
				</div>
			</CompactCard>
		);
	}
}

export default ShippingCard;
