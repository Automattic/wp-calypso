/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DashboardWidget from 'woocommerce/components/dashboard-widget';
import formatCurrency from 'lib/format-currency';
import { getLink } from 'woocommerce/lib/nav-utils';

const ProcessOrdersWidget = ( { site, orders, currency, ordersRevenue, translate } ) => {
	const currencyValue = ( currency && currency.value ) || '';
	const orderCountPhrase = translate( 'New order', 'New orders', {
		count: orders.length,
	} );
	return (
		<DashboardWidget width="two-thirds" className="process-orders-widget">
			<div>
				<span>{ orders.length }</span>
				<span className="process-orders-widget__order-label">✨ { orderCountPhrase }</span>
			</div>
			<div>
				<span className="process-orders-widget__revenue-amount">
					{ formatCurrency( ordersRevenue, currencyValue ) || ordersRevenue }
				</span>
				<span className="process-orders-widget__revenue-label">{ translate( '💰 Revenue' ) }</span>
			</div>
			<div>
				<Button href={ getLink( '/store/orders/:site', site ) }>
					{ translate( 'Process orders' ) }
				</Button>
			</div>
		</DashboardWidget>
	);
};

ProcessOrdersWidget.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string.isRequired,
	} ),
	orders: PropTypes.array,
	ordersRevenue: PropTypes.number,
	currency: PropTypes.shape( {
		value: PropTypes.string,
	} ),
};

export default localize( ProcessOrdersWidget );
