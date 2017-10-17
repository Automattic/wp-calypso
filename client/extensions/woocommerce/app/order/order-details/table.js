/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { find, findIndex, noop } from 'lodash';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import FormTextInput from 'components/forms/form-text-input';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	getOrderDiscountTax,
	getOrderFeeTax,
	getOrderLineItemTax,
	getOrderShippingTax,
	getOrderTotalTax,
} from 'woocommerce/lib/order-values';
import {
	getOrderItemCost,
	getOrderRefundTotal,
	getOrderTotal,
} from 'woocommerce/lib/order-values/totals';
import OrderTotalRow from './row-total';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class OrderDetailsTable extends Component {
	static propTypes = {
		isEditing: PropTypes.bool,
		onChange: PropTypes.func,
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

	static defaultProps = {
		isEditing: false,
		onChange: noop,
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

	onChange = event => {
		const { order } = this.props;
		// Name is `quantity-x`, where x is the ID of the item
		const id = parseInt( event.target.name.split( '-' )[ 1 ] );
		const item = find( order.line_items, { id } );
		if ( ! item ) {
			return;
		}
		const index = findIndex( order.line_items, { id } );
		// A zero quantity does strange things with the price, so we'll force 1
		const quantity = parseInt( event.target.value ) || 1;
		const subtotal = getOrderItemCost( order, id ) * quantity;
		const total = subtotal;
		const newItem = { ...item, quantity, subtotal, total };
		this.props.onChange( { [ index ]: newItem } );
	};

	renderQuantity = item => {
		const { isEditing } = this.props;
		if ( isEditing ) {
			return (
				<FormTextInput
					type="number"
					name={ `quantity-${ item.id }` }
					onChange={ this.onChange }
					value={ item.quantity }
				/>
			);
		}
		return item.quantity;
	};

	renderName = item => {
		const { isEditing, site } = this.props;
		if ( isEditing ) {
			return <span className="order-details__item-link">{ item.name }</span>;
		}
		return (
			<a
				href={ getLink( `/store/product/:site/${ item.product_id }`, site ) }
				className="order-details__item-link"
			>
				{ item.name }
			</a>
		);
	};

	renderOrderItems = ( item, i ) => {
		const { order } = this.props;
		const tax = getOrderLineItemTax( order, item.id );
		return (
			<TableRow key={ item.id } className="order-details__items">
				<TableItem isRowHeader className="order-details__item-product">
					{ this.renderName( item ) }
					<span className="order-details__item-sku">{ item.sku }</span>
				</TableItem>
				<TableItem className="order-details__item-cost">
					{ formatCurrency( item.price, order.currency ) }
				</TableItem>
				<TableItem className="order-details__item-quantity">
					{ this.renderQuantity( item, i ) }
				</TableItem>
				<TableItem className="order-details__item-tax">
					{ formatCurrency( tax, order.currency ) }
				</TableItem>
				<TableItem className="order-details__item-total">
					{ formatCurrency( item.total, order.currency ) }
				</TableItem>
			</TableRow>
		);
	};

	renderOrderFees = ( item, i ) => {
		const { order, translate } = this.props;
		const tax = getOrderFeeTax( order, i );
		return (
			<TableRow key={ i } className="order-details__items">
				<TableItem isRowHeader className="order-details__item-product" colSpan="3">
					{ item.name }
					<span className="order-details__item-sku">{ translate( 'Fee' ) }</span>
				</TableItem>
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
		const { isEditing, order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const showTax = this.shouldShowTax();
		const totalsClasses = classnames( {
			'order-details__totals': true,
			'has-taxes': showTax,
		} );
		const refundValue = getOrderRefundTotal( order );
		const totalTaxValue = getOrderTotalTax( order );
		const totalValue = isEditing ? getOrderTotal( order ) + totalTaxValue : order.total;

		return (
			<div>
				<Table className="order-details__table" header={ this.renderTableHeader() }>
					{ order.line_items.map( this.renderOrderItems ) }
					{ order.fee_lines.map( this.renderOrderFees ) }
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
						value={ totalValue }
						taxValue={ totalTaxValue }
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
