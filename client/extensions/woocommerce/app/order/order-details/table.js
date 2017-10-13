/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	getOrderDiscountTax,
	getOrderLineItemTax,
	getOrderRefundTotal,
	getOrderShippingTax,
	getOrderTotalTax,
} from 'woocommerce/lib/order-values';
import OrderTotalRow from './row-total';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class OrderDetailsTable extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			discount_total: PropTypes.string.isRequired,
			line_items: PropTypes.array.isRequired,
			refunds: PropTypes.array.isRequired,
			shipping_total: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
		translate: PropTypes.func,
	};

	shouldShowTax = () => {
		const { order } = this.props;
		if ( ! order ) {
			return false;
		}
		// If there are any items in `tax_lines`, we have taxes on this order.
		return !! order.tax_lines.length;
	};

	renderTableHeader = () => {
		const { translate } = this.props;
		return (
			<TableRow className="order-details__header">
				<TableItem isHeader className="order-details__item-product">
					{ translate( 'Product' ) }
				</TableItem>
				<TableItem isHeader className="order-details__item-cost">
					{ translate( 'Cost' ) }
				</TableItem>
				<TableItem isHeader className="order-details__item-quantity">
					{ translate( 'Quantity' ) }
				</TableItem>
				<TableItem isHeader className="order-details__item-tax">
					{ translate( 'Tax' ) }
				</TableItem>
				<TableItem isHeader className="order-details__item-total">
					{ translate( 'Total' ) }
				</TableItem>
			</TableRow>
		);
	};

	renderOrderItems = ( item, i ) => {
		const { order, site } = this.props;
		const tax = getOrderLineItemTax( order, i );
		return (
			<TableRow key={ i } className="order-details__items">
				<TableItem isRowHeader className="order-details__item-product">
					<a
						href={ getLink( `/store/product/:site/${ item.product_id }`, site ) }
						className="order-details__item-link"
					>
						{ item.name }
					</a>
					<span className="order-details__item-sku">{ item.sku }</span>
				</TableItem>
				<TableItem className="order-details__item-cost">
					{ formatCurrency( item.price, order.currency ) }
				</TableItem>
				<TableItem className="order-details__item-quantity">{ item.quantity }</TableItem>
				<TableItem className="order-details__item-tax">
					{ formatCurrency( tax, order.currency ) }
				</TableItem>
				<TableItem className="order-details__item-total">
					{ formatCurrency( item.total, order.currency ) }
				</TableItem>
			</TableRow>
		);
	};

	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const showTax = this.shouldShowTax();
		const totalsClasses = classnames( {
			'order-details__totals': true,
			'has-taxes': showTax,
		} );
		const refundValue = getOrderRefundTotal( order );

		return (
			<div>
				<Table className="order-details__table" header={ this.renderTableHeader() }>
					{ order.line_items.map( this.renderOrderItems ) }
				</Table>

				<div className={ totalsClasses }>
					<OrderTotalRow
						currency={ order.currency }
						label={ translate( 'Discount' ) }
						value={ order.discount_total }
						taxValue={ getOrderDiscountTax( order ) }
						showTax={ showTax }
					/>
					<OrderTotalRow
						currency={ order.currency }
						label={ translate( 'Shipping' ) }
						value={ order.shipping_total }
						taxValue={ getOrderShippingTax( order ) }
						showTax={ showTax }
					/>
					<OrderTotalRow
						className="order-details__total-full"
						currency={ order.currency }
						label={ translate( 'Total' ) }
						value={ order.total }
						taxValue={ getOrderTotalTax( order ) }
						showTax={ showTax }
					/>
					{ !! refundValue && (
						<OrderTotalRow
							className="order-details__total-refund"
							currency={ order.currency }
							label={ translate( 'Refunded' ) }
							value={ refundValue }
							showTax={ showTax }
						/>
					) }
				</div>
			</div>
		);
	}
}

export default localize( OrderDetailsTable );
