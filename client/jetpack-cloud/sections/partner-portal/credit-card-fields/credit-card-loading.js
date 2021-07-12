/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	LeftColumn,
	RightColumn,
} from 'calypso/my-sites/checkout/composite-checkout/components/ie-fallback';
import PaymentMethodImage from 'calypso/jetpack-cloud/sections/partner-portal/credit-card-fields/payment-method-image';

/**
 * Style dependencies
 */
import './style.scss';

export default function CreditCardLoading() {
	return (
		<div className="credit-card-fields credit-card-fields--placeholder">
			<div className="credit-card-fields__form">
				<div className="credit-card-fields__field"></div>

				<div className="credit-card-fields__field"></div>

				<div className="credit-card-fields__field"></div>

				<div className="credit-card-fields__field-block">
					<div className="credit-card-fields__field"></div>

					<div className="credit-card-fields__field-row">
						<LeftColumn>
							<div className="credit-card-fields__field"></div>
						</LeftColumn>
						<RightColumn>
							<div className="credit-card-fields__field"></div>
						</RightColumn>
					</div>
				</div>
			</div>
			<div className="credit-card-fields__image">
				<PaymentMethodImage />
			</div>
		</div>
	);
}
