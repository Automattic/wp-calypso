/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { clone, get, setWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyFormatDecimal } from 'woocommerce/lib/currency';
import {
	getOrderDiscountTax,
	getOrderFeeTax,
	getOrderShippingTax,
	getOrderTotalTax,
} from 'woocommerce/lib/order-values';
import { getOrderFeeCost, getOrderRefundTotal } from 'woocommerce/lib/order-values/totals';
import OrderLineItem from '../order-details/line-item';
import OrderTotalRow from '../order-details/row-total';
import PriceInput from 'woocommerce/components/price-input';
import { ScreenReaderText } from '@automattic/components';
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

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.order.id !== this.props.order.id ) {
			this.initializeState( nextProps );
		}
	}

	initializeState = ( props ) => {
		const { order } = props;
		const shippingTax = getOrderShippingTax( order );
		const shippingTotal = parseFloat( shippingTax ) + parseFloat( order.shipping_total );

		this.state = {
			quantities: {},
			fees: props.order.fee_lines.map( ( item ) => {
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

	formatInput = ( name ) => {
		const { order } = this.props;
		return () => {
			this.setState( ( prevState ) => {
				const newValue = getCurrencyFormatDecimal( get( prevState, name ), order.currency );
				// Update the new value in state without mutations https://github.com/lodash/lodash/issues/1696#issuecomment-328335502
				const newState = setWith( clone( prevState ), name, newValue, clone );
				return newState;
			} );
		};
	};

	validateValue = ( value ) => {
		if ( '' === value ) {
			return value;
		}
		value = value.replace( /[^0-9,.-]/g, '' );
		if ( ! isNaN( parseFloat( value ) ) && parseFloat( value ) >= 0 ) {
			return value;
		}
		return 0;
	};

	onChange = ( type, i = false ) => ( event ) => {
		const value = this.validateValue( event.target.value );
		switch ( type ) {
			case 'shipping_total':
				this.setState( { shippingTotal: value }, this.triggerRecalculate );
				break;
			case 'quantity':
				this.setState( ( prevState ) => {
					const newQuants = prevState.quantities;
					newQuants[ i ] = value;
					return { quantities: newQuants };
				}, this.triggerRecalculate );
				break;
			case 'fee':
				this.setState( ( prevState ) => {
					const newFees = prevState.fees;
					newFees[ i ] = value;
					return { fees: newFees };
				}, this.triggerRecalculate );
				break;
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

	renderOrderItem = ( item ) => {
		const { order, site, translate } = this.props;
		const inputId = `quantity-${ item.id }`;
		return (
			<OrderLineItem key={ item.id } isEditing item={ item } order={ order } site={ site }>
				<label htmlFor={ inputId }>
					<ScreenReaderText>
						{ translate( 'Quantity of %(item)s', { args: { item: item.name } } ) }
					</ScreenReaderText>
				</label>

				<FormTextInput
					type="number"
					id={ inputId }
					onChange={ this.onChange( 'quantity', item.id ) }
					min="0"
					max={ item.quantity }
					value={ this.state.quantities[ item.id ] || 0 }
				/>
			</OrderLineItem>
		);
	};

	renderOrderFee = ( item, i ) => {
		const { order, translate } = this.props;
		const value = this.state.fees[ i ];
		const inputId = `fee_line-${ item.id }`;
		const initialValue = getOrderFeeCost( order, item.id ) + getOrderFeeTax( order, item.id );
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
					<label htmlFor={ inputId }>
						<ScreenReaderText>
							{ translate( 'Value of fee %(item)s', { args: { item: item.name } } ) }
						</ScreenReaderText>
					</label>
					<PriceInput
						id={ inputId }
						currency={ order.currency }
						initialValue={ getCurrencyFormatDecimal( initialValue, order.currency ) }
						value={ value }
						onChange={ this.onChange( 'fee', i ) }
						onBlur={ this.formatInput( `fees[${ i }]` ) }
					/>
				</TableItem>
			</TableRow>
		);
	};

	renderRefundTotals = () => {
		const { isEditing, order, translate } = this.props;
		const refundValue = getOrderRefundTotal( order );
		if ( isEditing || ! refundValue ) {
			return null;
		}
		const showTax = this.shouldShowTax();
		const totalValue = getCurrencyFormatDecimal( order.total, order.currency ) + refundValue;

		return (
			<Fragment>
				<OrderTotalRow
					className="order-payment__total-refund order-details__total-refund"
					currency={ order.currency }
					label={ translate( 'Refunded' ) }
					value={ refundValue }
					showTax={ showTax }
				/>
				<OrderTotalRow
					className="order-payment__total-remaining order-details__total-remaining"
					currency={ order.currency }
					label={ translate( 'Remaining total' ) }
					value={ totalValue }
					showTax={ showTax }
				/>
			</Fragment>
		);
	};

	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const showTax = this.shouldShowTax();
		const refundValue = getOrderRefundTotal( order );
		const totalsClasses = classnames( {
			'order-payment__totals': true,
			'order-details__totals': true,
			'has-taxes': showTax,
			'has-refund': !! refundValue,
			'is-refund-modal': true,
		} );
		const initialShippingValue = getCurrencyFormatDecimal(
			parseFloat( order.shipping_total ) + getOrderShippingTax( order ),
			order.currency
		);

		return (
			<div>
				<Table
					className="order-payment__table order-details__table"
					header={ this.renderTableHeader() }
				>
					{ order.line_items.map( this.renderOrderItem ) }
					{ order.fee_lines.map( this.renderOrderFee ) }
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
						initialValue={ initialShippingValue }
						value={ this.state.shippingTotal }
						name="shipping_total"
						onChange={ this.onChange( 'shipping_total' ) }
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
					{ this.renderRefundTotals() }
				</Table>
			</div>
		);
	}
}

export default localize( OrderRefundTable );
