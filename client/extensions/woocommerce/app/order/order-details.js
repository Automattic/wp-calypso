/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import formatCurrency from 'lib/format-currency';
import SectionHeader from 'components/section-header';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class OrderDetails extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			discount_total: PropTypes.string.isRequired,
			line_items: PropTypes.array.isRequired,
			payment_method_title: PropTypes.string.isRequired,
			shipping_total: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
	}

	getRefundedTotal = ( order ) => {
		return order.refunds.reduce( ( sum, i ) => sum + ( i.total * 1 ), 0 );
	}

	renderTableHeader = () => {
		const { translate } = this.props;
		return (
			<TableRow className="order__detail-header">
				<TableItem isHeader className="order__detail-item-product">{ translate( 'Product' ) }</TableItem>
				<TableItem isHeader className="order__detail-item-cost">{ translate( 'Cost' ) }</TableItem>
				<TableItem isHeader className="order__detail-item-quantity">{ translate( 'Quantity' ) }</TableItem>
				<TableItem isHeader className="order__detail-item-total">{ translate( 'Total' ) }</TableItem>
			</TableRow>
		);
	}

	renderOrderItems = ( item, i ) => {
		const { order, siteSlug } = this.props;
		return (
			<TableRow key={ i } className="order__detail-items">
				<TableItem isRowHeader className="order__detail-item-product">
					<a href={ `/store/product/${ siteSlug }/${ item.product_id }` } className="order__detail-item-link">
						{ item.name }
					</a>
					<span className="order__detail-item-sku">{ item.sku }</span>
				</TableItem>
				<TableItem className="order__detail-item-cost">{ formatCurrency( item.price, order.currency ) || item.price }</TableItem>
				<TableItem className="order__detail-item-quantity">{ item.quantity }</TableItem>
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

	renderRefundCard = () => {
		const { order, translate } = this.props;
		let refundStatus = translate( 'Payment of %(total)s received via %(method)s', {
			args: {
				total: formatCurrency( order.total, order.currency ) || order.total,
				method: order.payment_method_title,
			}
		} );

		if ( 'refunded' === order.status ) {
			refundStatus = translate( 'Payment of %(total)s has been refunded', {
				args: {
					total: formatCurrency( order.total, order.currency ) || order.total,
				}
			} );
		} else if ( order.refunds.length ) {
			const refund = this.getRefundedTotal( order );
			refundStatus = translate( 'Payment of %(total)s has been partially refunded %(refund)s', {
				args: {
					total: formatCurrency( order.total, order.currency ) || order.total,
					refund: formatCurrency( refund, order.currency ) || refund,
				}
			} );
		}

		return (
			<div className="order__details-refund">
				<div className="order__details-refund-label">
					<Gridicon icon="checkmark" />
					{ refundStatus }
				</div>
				<div className="order__details-refund-action">
					{ ( 'refunded' !== order.status )
						? <Button>{ translate( 'Submit Refund' ) }</Button>
						: null
					}
				</div>
			</div>
		);
	}

	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order__details">
				<SectionHeader label={ translate( 'Order Details' ) } />
				<Card className="order__details-card">
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
								{ formatCurrency( order.shipping_total, order.currency ) || order.shipping_total }
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

					{ this.renderRefundCard() }

					<div className="order__details-fulfillment">
						<div className="order__details-fulfillment-label">
							<Gridicon icon="shipping" />
							{ translate( 'Order needs to be fulfilled' ) }
						</div>
						<div className="order__details-fulfillment-action">
							<Button primary>{ translate( 'Print label' ) }</Button>
						</div>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( OrderDetails );
