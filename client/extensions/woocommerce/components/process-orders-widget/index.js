/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import formatCurrency from 'lib/format-currency';
import { getLink } from 'woocommerce/lib/nav-utils';

const ProcessOrdersWidget = ( { className, site, orders, ordersRevenue, translate } ) => {
	const classes = classNames( 'card', 'process-orders-widget__container', className );
	// TODO Use API supplied currency.
	return (
		<div className={ classes } >
			<div>
				<span>{ orders.length }</span>
				<span>{ translate( 'New orders' ) }</span>
			</div>
			<div>
				<span>{ formatCurrency( ordersRevenue, 'USD' ) }</span>
				<span>{ translate( 'Revenue' ) }</span>
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
};

export default localize( ProcessOrdersWidget );
