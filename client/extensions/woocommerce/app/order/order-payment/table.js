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
import FormTextInput from 'components/forms/form-text-input';
import {
	getOrderDiscountTax,
	getOrderLineItemTax,
	getOrderRefundTotal,
	getOrderShippingTax,
	getOrderTotalTax,
} from 'woocommerce/lib/order-values';
import OrderTotalRow from '../order-details/row-total';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class OrderRefundTable extends Component {
	static propTypes = {
		onChange: PropTypes.func,
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			discount_total: PropTypes.string.isRequired,
			line_items: PropTypes.array.isRequired,
			refunds: PropTypes.array.isRequired,
			shipping_total: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
	};

	constructor( props ) {
		super( props );
		const shippingTax = getOrderShippingTax( props.order );
		this.state = {
			quantities: [],
			shippingTotal: parseFloat( shippingTax ) + parseFloat( props.order.shipping_total ),
		};
	}

	shouldShowTax = () => {
		const { order } = this.props;
		if ( ! order ) {
			return false;
		}
		// If there are any items in `tax_lines`, we have taxes on this order.
		return !! order.tax_lines.length;
	};

	triggerRecalculate = () => {
		this.props.onChange( this.state );
	};

	onChange = event => {
		if ( 'shipping_total' === event.target.name ) {
			const shippingTotal = event.target.value.replace( /[^0-9,.]/g, '' );
			this.setState( { shippingTotal }, this.triggerRecalculate );
		} else {
			// Name is `quantity-x`, where x is the ID in the line_items array
			const i = event.target.name.split( '-' )[ 1 ];
			const newQuants = this.state.quantities;
			newQuants[ i ] = event.target.value;
			this.setState( { quantities: newQuants }, this.triggerRecalculate );
		}
	};

	renderTableHeader = () => {
		const { translate } = this.props;
		return (
			<TableRow className="order-payment__header order-details__header">
				<TableItem isHeader className="order-payment__item-product order-details__item-product">
					{ translate( 'Product' ) }
				</TableItem>
				<TableItem isHeader className="order-payment__item-cost order-details__item-cost">
					{ translate( 'Cost' ) }
				</TableItem>
				<TableItem isHeader className="order-payment__item-quantity order-details__item-quantity">
					{ translate( 'Quantity' ) }
				</TableItem>
				<TableItem isHeader className="order-payment__item-tax order-details__item-tax">
					{ translate( 'Tax' ) }
				</TableItem>
				<TableItem isHeader className="order-payment__item-total order-details__item-total">
					{ translate( 'Total' ) }
				</TableItem>
			</TableRow>
		);
	};

	renderOrderItems = ( item, i ) => {
		const { order } = this.props;
		const tax = getOrderLineItemTax( order, i );
		return (
			<TableRow key={ i } className="order-payment__items order-details__items">
				<TableItem isRowHeader className="order-payment__item-product order-details__item-product">
					<span className="order-payment__item-link order-details__item-link">{ item.name }</span>
					<span className="order-payment__item-sku order-details__item-sku">{ item.sku }</span>
				</TableItem>
				<TableItem className="order-payment__item-cost order-details__item-cost">
					{ formatCurrency( item.price, order.currency ) }
				</TableItem>
				<TableItem className="order-payment__item-quantity order-details__item-quantity">
					<FormTextInput
						type="number"
						name={ `quantity-${ i }` }
						onChange={ this.onChange }
						min="0"
						max={ item.quantity }
						value={ this.state.quantities[ i ] || 0 }
					/>
				</TableItem>
				<TableItem className="order-payment__item-tax order-details__item-tax">
					{ formatCurrency( tax, order.currency ) }
				</TableItem>
				<TableItem className="order-payment__item-total order-details__item-total">
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
			'order-payment__totals': true,
			'order-details__totals': true,
			'has-taxes': showTax,
			'is-refund-modal': true,
		} );
		const refundValue = getOrderRefundTotal( order );

		return (
			<div>
				<Table
					className="order-payment__table order-details__table"
					header={ this.renderTableHeader() }
				>
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
						isEditable
						currency={ order.currency }
						label={ translate( 'Shipping' ) }
						value={ this.state.shippingTotal }
						name="shipping_total"
						onChange={ this.onChange }
					/>
					<OrderTotalRow
						className="order-payment__total-full order-details__total-full"
						currency={ order.currency }
						label={ translate( 'Total' ) }
						value={ order.total }
						taxValue={ getOrderTotalTax( order ) }
						showTax={ showTax }
					/>
					{ !! refundValue && (
						<OrderTotalRow
							className="order-payment__total-refund order-details__total-refund"
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

export default localize( OrderRefundTable );
