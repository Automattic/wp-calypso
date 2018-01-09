/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getOrderLineItemTax } from 'woocommerce/lib/order-values';
import { getOrderItemCost } from 'woocommerce/lib/order-values/totals';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

// A shortcut for number or string proptypes, because prices and IDs can be either.
const PropTypeNumberOrString = PropTypes.oneOfType( [
	PropTypes.string.isRequired,
	PropTypes.number.isRequired,
] );

class OrderLineItem extends Component {
	static propTypes = {
		deleteButton: PropTypes.element,
		isEditing: PropTypes.bool,
		item: PropTypes.shape( {
			id: PropTypeNumberOrString,
			name: PropTypes.string.isRequired,
			price: PropTypeNumberOrString,
			product_id: PropTypes.number.isRequired,
			quantity: PropTypes.number.isRequired,
			subtotal: PropTypeNumberOrString,
			total: PropTypeNumberOrString,
		} ),
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

	render() {
		const { deleteButton, item, order, children: quantityField } = this.props;
		const tax = getOrderLineItemTax( order, item.id );
		if ( item.quantity <= 0 ) {
			return null;
		}
		let itemPrice = formatCurrency( item.price, order.currency );
		let itemTotal = formatCurrency( item.total, order.currency );
		if ( parseFloat( item.total ) !== parseFloat( item.subtotal ) ) {
			const preDiscountCost = getOrderItemCost( order, item.id );
			itemPrice = (
				<Fragment>
					<del className="order-details__item-pre-discount">
						{ formatCurrency( preDiscountCost, order.currency ) }
					</del>
					<ins className="order-details__item-with-discount">
						{ formatCurrency( item.price, order.currency ) }
					</ins>
				</Fragment>
			);

			itemTotal = (
				<Fragment>
					<del className="order-details__item-pre-discount">
						{ formatCurrency( item.subtotal, order.currency ) }
					</del>
					<ins className="order-details__item-with-discount">
						{ formatCurrency( item.total, order.currency ) }
					</ins>
				</Fragment>
			);
		}
		return (
			<TableRow key={ item.id } className="order-details__items">
				<TableItem isRowHeader className="order-details__item-product">
					{ this.renderName( item ) }
					<span className="order-details__item-sku">{ item.sku }</span>
				</TableItem>
				<TableItem className="order-details__item-cost">{ itemPrice }</TableItem>
				<TableItem className="order-details__item-quantity">{ quantityField }</TableItem>
				<TableItem className="order-details__item-tax">
					{ formatCurrency( tax, order.currency ) }
				</TableItem>
				<TableItem className="order-details__item-total">{ itemTotal }</TableItem>
				{ deleteButton || null }
			</TableRow>
		);
	}
}

export default localize( OrderLineItem );
