/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import { sum } from 'lodash';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import FormTextInput from 'components/forms/form-text-input';
import { getLink } from 'woocommerce/lib/nav-utils';
import PriceInput from 'woocommerce/components/price-input';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

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
		this.state = {
			quantities: [],
			shippingTotal: 0,
		};
	}

	getRefundedTotal = ( order ) => {
		return order.refunds.reduce( ( total, i ) => total + ( i.total * 1 ), 0 );
	}

	recalculateRefund = () => {
		if ( ! this.props.order ) {
			return 0;
		}
		const subtotal = sum( this.state.quantities.map( ( q, i ) => {
			if ( ! this.props.order.line_items[ i ] ) {
				return 0;
			}
			const price = parseFloat( this.props.order.line_items[ i ].price );
			const tax = parseFloat( this.props.order.line_items[ i ].total_tax );
			const taxIncludedPrice = price + tax;
			if ( this.props.order.prices_include_tax ) {
				return price * q;
			}
			return taxIncludedPrice * q;
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
			<TableRow className="order__detail-header">
				<TableItem isHeader className="order__detail-item-product">{ translate( 'Product' ) }</TableItem>
				<TableItem isHeader className="order__detail-item-cost">{ translate( 'Cost' ) }</TableItem>
				<TableItem isHeader className="order__detail-item-quantity">{ translate( 'Quantity' ) }</TableItem>
				<TableItem isHeader className="order__detail-item-total">{ translate( 'Tax' ) }</TableItem>
				<TableItem isHeader className="order__detail-item-total">{ translate( 'Total' ) }</TableItem>
			</TableRow>
		);
	}

	renderOrderItems = ( item, i ) => {
		const { isEditable, order, site } = this.props;
		return (
			<TableRow key={ i } className="order__detail-items">
				<TableItem isRowHeader className="order__detail-item-product">
					<a href={ getLink( `/store/product/:site/${ item.product_id }`, site ) } className="order__detail-item-link">
						{ item.name }
					</a>
					<span className="order__detail-item-sku">{ item.sku }</span>
				</TableItem>
				<TableItem className="order__detail-item-cost">{ formatCurrency( item.price, order.currency ) || item.price }</TableItem>
				<TableItem className="order__detail-item-quantity">
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
				<TableItem className="order__detail-item-total">
					{ formatCurrency( item.total_tax, order.currency ) || item.total_tax }
				</TableItem>
				<TableItem className="order__detail-item-total">{ formatCurrency( item.total, order.currency ) || item.total }</TableItem>
			</TableRow>
		);
	}

	renderRefundValue = () => {
		const { order, translate } = this.props;
		const refundValue = order.refunds.length ? this.getRefundedTotal( order ) : false;
		if ( ! refundValue ) {
			return null;
		}

		return (
			<div className="order__details-total-refund">
				<div className="order__details-totals-label">{ translate( 'Refunded' ) }</div>
				<div className="order__details-totals-value">
					{ formatCurrency( refundValue, order.currency ) || refundValue }
				</div>
			</div>
		);
	}

	render() {
		const { isEditable, order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div>
				<Table className="order__details-table" header={ this.renderTableHeader() }>
					{ order.line_items.map( this.renderOrderItems ) }
				</Table>

				<div className="order__details-totals">
					<div className="order__details-total-discount">
						<div className="order__details-totals-label">{ translate( 'Discount' ) }</div>
						<div className="order__details-totals-value">
							{ formatCurrency( order.discount_total, order.currency ) || order.discount_total }
						</div>
					</div>
					<div className="order__details-total-shipping">
						<div className="order__details-totals-label">{ translate( 'Shipping' ) }</div>
						<div className="order__details-totals-value">
							{ isEditable
								? <PriceInput
									name="shipping_total"
									onChange={ this.onChange }
									currency={ order.currency }
									value={ this.state.shippingTotal } />
								: formatCurrency( order.shipping_total, order.currency ) || order.shipping_total
							}
						</div>
					</div>
					<div className="order__details-total-tax">
						<div className="order__details-totals-label">{ translate( 'Tax' ) }</div>
						<div className="order__details-totals-value">
							{ formatCurrency( order.total_tax, order.currency ) || order.total_tax }
						</div>
					</div>
					<div className="order__details-total">
						<div className="order__details-totals-label">{ translate( 'Total' ) }</div>
						<div className="order__details-totals-value">
							{ formatCurrency( order.total, order.currency ) || order.total }
						</div>
					</div>
					{ this.renderRefundValue() }
				</div>
			</div>
		);
	}
}

export default localize( OrderDetailsTable );
