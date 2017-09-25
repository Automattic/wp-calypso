/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { sum } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import OrderDiscountRow from './row-discount';
import OrderRefundRow from './row-refund';
import OrderShippingRow from './row-shipping';
import OrderShippingRefundRow from './row-shipping-refund';
import OrderTotalRow from './row-total';
import FormTextInput from 'components/forms/form-text-input';
import formatCurrency from 'lib/format-currency';
import Table from 'woocommerce/components/table';
import TableItem from 'woocommerce/components/table/table-item';
import TableRow from 'woocommerce/components/table/table-row';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getOrderLineItemTax, getOrderShippingTax } from 'woocommerce/lib/order-taxes';

class OrderDetailsTable extends Component {
	static propTypes = {
		isEditable: PropTypes.bool,
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
	}

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
	}

	recalculateRefund = () => {
		const { order } = this.props;
		if ( ! order ) {
			return 0;
		}
		const subtotal = sum( this.state.quantities.map( ( q, i ) => {
			if ( ! order.line_items[ i ] ) {
				return 0;
			}

			const price = parseFloat( order.line_items[ i ].price );
			if ( order.prices_include_tax ) {
				return price * q;
			}

			const tax = getOrderLineItemTax( order, i ) / order.line_items[ i ].quantity;
			return ( price + tax ) * q;
		} ) );
		const total = subtotal + ( parseFloat( this.state.shippingTotal ) || 0 );
		this.props.onChange( total );
	}

	onChange = ( event ) => {
		if ( 'shipping_total' === event.target.name ) {
			const shippingTotal = event.target.value.replace( /[^0-9,.]/g, '' );
			this.setState( { shippingTotal }, this.recalculateRefund );
		} else {
			// Name is `quantity-x`, where x is the ID in the line_items array
			const i = event.target.name.split( '-' )[ 1 ];
			const newQuants = this.state.quantities;
			newQuants[ i ] = event.target.value;
			this.setState( { quantities: newQuants }, this.recalculateRefund );
		}
	}

	renderTableHeader = () => {
		const { translate } = this.props;
		return (
			<TableRow className="order-details__header">
				<TableItem isHeader className="order-details__item-product">{ translate( 'Product' ) }</TableItem>
				<TableItem isHeader className="order-details__item-cost">{ translate( 'Cost' ) }</TableItem>
				<TableItem isHeader className="order-details__item-quantity">{ translate( 'Quantity' ) }</TableItem>
				<TableItem isHeader className="order-details__item-tax">{ translate( 'Tax' ) }</TableItem>
				<TableItem isHeader className="order-details__item-total">{ translate( 'Total' ) }</TableItem>
			</TableRow>
		);
	}

	renderOrderItems = ( item, i ) => {
		const { isEditable, order, site } = this.props;
		const tax = getOrderLineItemTax( order, i );
		return (
			<TableRow key={ i } className="order-details__items">
				<TableItem isRowHeader className="order-details__item-product">
					<a href={ getLink( `/store/product/:site/${ item.product_id }`, site ) } className="order-details__item-link">
						{ item.name }
					</a>
					<span className="order-details__item-sku">{ item.sku }</span>
				</TableItem>
				<TableItem className="order-details__item-cost">{ formatCurrency( item.price, order.currency ) }</TableItem>
				<TableItem className="order-details__item-quantity">
					{ isEditable
						? <FormTextInput
							type="number"
							name={ `quantity-${ i }` }
							onChange={ this.onChange }
							min="0"
							max={ item.quantity }
							value={ this.state.quantities[ i ] || 0 } />
						: item.quantity
					}
				</TableItem>
				<TableItem className="order-details__item-tax">
					{ formatCurrency( tax, order.currency ) }
				</TableItem>
				<TableItem className="order-details__item-total">{ formatCurrency( item.total, order.currency ) }</TableItem>
			</TableRow>
		);
	}

	render() {
		const { isEditable, order } = this.props;
		if ( ! order ) {
			return null;
		}

		const showTax = this.shouldShowTax();
		const totalsClasses = classnames( {
			'order-details__totals': true,
			'has-taxes': showTax,
			'is-refund-modal': isEditable,
		} );

		return (
			<div>
				<Table className="order-details__table" header={ this.renderTableHeader() }>
					{ order.line_items.map( this.renderOrderItems ) }
				</Table>

				<div className={ totalsClasses }>
					<OrderDiscountRow order={ order } showTax={ showTax } />
					{ isEditable
						? <OrderShippingRefundRow
							currency={ order.currency }
							onChange={ this.onChange }
							shippingTotal={ this.state.shippingTotal } />
						: <OrderShippingRow order={ order } showTax={ showTax } />
					}
					<OrderTotalRow order={ order } showTax={ showTax } />
					<OrderRefundRow order={ order } showTax={ showTax } />
				</div>
			</div>
		);
	}
}

export default localize( OrderDetailsTable );
