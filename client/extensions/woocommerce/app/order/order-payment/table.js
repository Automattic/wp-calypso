/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { clone, get, setWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyFormatDecimal } from 'woocommerce/lib/currency';
import {
	getOrderDiscountTax,
	getOrderFeeTax,
	getOrderLineItemTax,
	getOrderShippingTax,
	getOrderTotalTax,
} from 'woocommerce/lib/order-values';
import { getOrderRefundTotal } from 'woocommerce/lib/order-values/totals';
import OrderTotalRow from '../order-details/row-total';
import PriceInput from 'woocommerce/components/price-input';
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
		this.initializeState( props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.order.id !== this.props.order.id ) {
			this.initializeState( nextProps );
		}
	}

	initializeState = props => {
		const { order } = props;
		const shippingTax = getOrderShippingTax( order );
		const shippingTotal = parseFloat( shippingTax ) + parseFloat( order.shipping_total );

		this.state = {
			quantities: {},
			fees: props.order.fee_lines.map( item => {
				const value =
					parseFloat( item.total ) + parseFloat( getOrderFeeTax( props.order, item.id ) );
				return getCurrencyFormatDecimal( value, order.currency );
			} ),
			shippingTotal: getCurrencyFormatDecimal( shippingTotal, order.currency ),
		};
	};

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

	formatInput = name => {
		const { order } = this.props;
		return () => {
			this.setState( prevState => {
				const newValue = getCurrencyFormatDecimal( get( prevState, name ), order.currency );
				// Update the new value in state without mutations https://github.com/lodash/lodash/issues/1696#issuecomment-328335502
				const newState = setWith( clone( prevState ), name, newValue, clone );
				return newState;
			} );
		};
	};

	onChange = event => {
		if ( 'shipping_total' === event.target.name ) {
			const shippingTotal = event.target.value.replace( /[^0-9,.]/g, '' );
			this.setState( { shippingTotal }, this.triggerRecalculate );
		} else {
			// Name is `quantity-x`, where x is the ID in the line_items array
			const [ type, i ] = event.target.name.split( '-' );
			const value = event.target.value;
			if ( 'quantity' === type ) {
				this.setState( prevState => {
					const newQuants = prevState.quantities;
					newQuants[ i ] = value;
					return { quantities: newQuants };
				}, this.triggerRecalculate );
			} else {
				this.setState( prevState => {
					const newFees = prevState.fees;
					newFees[ i ] = isNaN( parseFloat( value ) ) ? 0 : value;
					return { fees: newFees };
				}, this.triggerRecalculate );
			}
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

	renderOrderItems = item => {
		const { order } = this.props;
		const tax = getOrderLineItemTax( order, item.id );
		return (
			<TableRow key={ item.id } className="order-payment__items order-details__items">
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
						name={ `quantity-${ item.id }` }
						onChange={ this.onChange }
						min="0"
						max={ item.quantity }
						value={ this.state.quantities[ item.id ] || 0 }
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

	renderOrderFees = ( item, i ) => {
		const { order, translate } = this.props;
		const value = this.state.fees[ i ];
		return (
			<TableRow key={ i } className="order-payment__items order-details__items">
				<TableItem
					isRowHeader
					colSpan="3"
					className="order-payment__item-product order-details__item-product"
				>
					{ item.name }
					<span className="order-payment__item-sku order-details__item-sku">
						{ translate( 'Fee' ) }
					</span>
				</TableItem>
				<TableItem colSpan="2" className="order-payment__item-total order-details__item-total">
					<PriceInput
						name={ `fee_line-${ i }` }
						onChange={ this.onChange }
						onBlur={ this.formatInput( `fees[${ i }]` ) }
						currency={ order.currency }
						value={ value }
					/>
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
					{ order.fee_lines.map( this.renderOrderFees ) }
				</Table>

				<Table className={ totalsClasses } compact>
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
						onBlur={ this.formatInput( 'shippingTotal' ) }
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
				</Table>
			</div>
		);
	}
}

export default localize( OrderRefundTable );
