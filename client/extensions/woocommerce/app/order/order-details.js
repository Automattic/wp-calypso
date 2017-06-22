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
		return (
			<TableRow key={ i } className="order__detail-items">
				<TableItem isRowHeader className="order__detail-item-product">{ item.name }</TableItem>
				<TableItem className="order__detail-item-cost">{ item.price }</TableItem>
				<TableItem className="order__detail-item-quantity">{ item.quantity }</TableItem>
				<TableItem className="order__detail-item-total">{ item.total }</TableItem>
			</TableRow>
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
							<div className="order__details-totals-value">{ order.discount_total }</div>
						</div>
						<div className="order__details-total-shipping">
							<div className="order__details-totals-label">{ translate( 'Shipping' ) }</div>
							<div className="order__details-totals-value">{ order.shipping_total }</div>
						</div>
						<div className="order__details-total">
							<div className="order__details-totals-label">{ translate( 'Total' ) }</div>
							<div className="order__details-totals-value">{ order.total }</div>
						</div>
					</div>

					<div className="order__details-refund">
						<div className="order__details-refund-label">
							<Gridicon icon="checkmark" />
							{ translate( 'Payment of %(total)s received via %(method)s', {
								args: {
									total: order.total,
									method: order.payment_method_title
								}
							} ) }
						</div>
						<div className="order__details-refund-action">
							<Button>{ translate( 'Submit Refund' ) }</Button>
						</div>
					</div>

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
