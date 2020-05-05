/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

/* eslint-disable wpcalypso/jsx-classname-namespace */

const RefundAsterisk = () => (
	<div className="feature-upsell__text-content">
		<div className="feature-upsell__refund-asterisk">
			<p>Purchases made on WordPress.com can be cancelled and refunded during the refund period.</p>
			<p>
				For new domain registrations, you must cancel within 96 hours of purchase to receive a
				refund. There are no refunds, pro-rated or otherwise, after 96 hours.
			</p>
			<p>
				For plans and all other purchases, you must cancel within 30 days of purchase to receive a
				refund.
			</p>
		</div>
	</div>
);

export default localize( RefundAsterisk );
/* eslint-enable wpcalypso/jsx-classname-namespace */
