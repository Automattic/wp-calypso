/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import formatCurrency from 'lib/format-currency';
import { getLink } from 'woocommerce/lib/nav-utils';

const ProcessOrdersWidget = ( { className, site, orders, currency, ordersRevenue, translate } ) => {
	const classes = classNames( 'card', 'process-orders-widget__container', className );
	const currencyValue = ( currency && currency.value ) || '';
	const orderCountPhrase = translate( 'New order', 'New orders', {
		count: orders.length,
	} );
	return (
		<div className={ classes }>
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
		</div>
	);
};

ProcessOrdersWidget.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string.isRequired,
	} ),
	className: PropTypes.string,
	orders: PropTypes.array,
	ordersRevenue: PropTypes.number,
	currency: PropTypes.shape( {
		value: PropTypes.string,
	} ),
};

export default localize( ProcessOrdersWidget );
