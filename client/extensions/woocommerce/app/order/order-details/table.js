/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import { every, find, findIndex, get, isNaN, noop } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Button, ScreenReaderText } from '@automattic/components';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyFormatDecimal } from 'woocommerce/lib/currency';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	getOrderDiscountTax,
	getOrderFeeTax,
	getOrderShippingTax,
	getOrderTotalTax,
} from 'woocommerce/lib/order-values';
import {
	getOrderItemCost,
	getOrderRefundTotal,
	getOrderShippingTotal,
	getOrderTotal,
} from 'woocommerce/lib/order-values/totals';
import OrderAddItems from './add-items';
import OrderLineItem from './line-item';
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
		const { isEditing, translate } = this.props;
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
				{ isEditing && (
					<TableItem isHeader className="order-details__item-delete">
						<ScreenReaderText>{ translate( 'Delete' ) }</ScreenReaderText>
					</TableItem>
				) }
			</TableRow>
		);
	};

	onChange = ( event ) => {
		const { order } = this.props;
		// Name is `quantity-x`, where x is the ID of the item
		let id = event.target.name.split( '-' )[ 1 ];
		if ( ! isNaN( parseInt( id ) ) ) {
			id = parseInt( id );
		}
		const item = find( order.line_items, { id } );
		if ( ! item ) {
			return;
		}
		const index = findIndex( order.line_items, { id } );
		// A zero quantity does strange things with the price, so we'll force 1
		const quantity = Math.abs( event.target.value ) || 1;
		const subtotal = getOrderItemCost( order, id ) * quantity;
		const total = parseFloat( item.price ) * quantity;
		const newItem = { ...item, quantity, subtotal, total };
		this.props.onChange( { line_items: { [ index ]: newItem } } );
	};

	onShippingChange = ( event ) => {
		const { order } = this.props;
		const shippingLine = order.shipping_lines[ 0 ] || { method_id: 'manual' };
		const total = event.target.value;
		this.props.onChange( { shipping_lines: [ { ...shippingLine, total } ] } );
	};

	formatShippingValue = () => {
		const { order } = this.props;
		const shippingLine = order.shipping_lines[ 0 ];
		const total = getCurrencyFormatDecimal( shippingLine.total, order.currency );
		this.props.onChange( { shipping_lines: [ { ...shippingLine, total } ] } );
	};

	onDelete = ( id, type = 'line_items' ) => () => {
		const index = findIndex( this.props.order[ type ], { id } );
		if ( index >= 0 ) {
			let newItem;
			if ( 'line_items' === type ) {
				newItem = { id, quantity: 0, subtotal: 0 };
			} else {
				newItem = { id, name: null, total: 0 };
			}
			this.props.onChange( { [ type ]: { [ index ]: newItem } } );
		}
	};

	renderQuantity = ( item ) => {
		const { isEditing, translate } = this.props;
		const inputId = `quantity-${ item.id }`;
		if ( isEditing ) {
			return (
				<Fragment>
					<label htmlFor={ inputId }>
						<ScreenReaderText>
							{ translate( 'Quantity of %(item)s', { args: { item: item.name } } ) }
						</ScreenReaderText>
					</label>

					<FormTextInput
						type="number"
						id={ inputId }
						min={ 1 }
						name={ `quantity-${ item.id }` }
						onChange={ this.onChange }
						value={ item.quantity }
					/>
				</Fragment>
			);
		}
		return item.quantity;
	};

	renderName = ( item ) => {
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

	renderDeleteButton = ( item, type ) => {
		const { isEditing, translate } = this.props;
		if ( ! isEditing ) {
			return null;
		}
		return (
			<TableItem className="order-details__item-delete">
				<Button
					compact
					borderless
					aria-label={ translate( 'Remove %(itemName)s from this order', {
						args: { itemName: item.name },
					} ) }
					onClick={ this.onDelete( item.id, type ) }
				>
					<Gridicon icon="trash" />
				</Button>
			</TableItem>
		);
	};

	renderOrderItem = ( item ) => {
		const { isEditing, order, site } = this.props;
		const deleteButton = this.renderDeleteButton( item, 'line_items' );
		return (
			<OrderLineItem
				key={ item.id }
				deleteButton={ deleteButton }
				isEditing={ isEditing }
				item={ item }
				order={ order }
				site={ site }
			>
				{ this.renderQuantity( item ) }
			</OrderLineItem>
		);
	};

	renderOrderFee = ( item ) => {
		const { order, translate } = this.props;
		const tax = getOrderFeeTax( order, item.id );
		if ( item.total <= 0 ) {
			return null;
		}
		return (
			<TableRow key={ item.id } className="order-details__items">
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
				{ this.renderDeleteButton( item, 'fee_lines' ) }
			</TableRow>
		);
	};

	renderTaxWarning = () => {
		const { translate } = this.props;
		return (
			<FormSettingExplanation>
				{ translate( 'If applicable, taxes will be updated after saving.' ) }
			</FormSettingExplanation>
		);
	};

	renderCoupons = () => {
		const { order, site, translate } = this.props;
		const showTax = this.shouldShowTax();
		const coupons = order.coupon_lines || [];
		const hasCoupons = parseFloat( order.discount_total ) > 0 || order.coupon_lines.length > 0;
		if ( ! hasCoupons ) {
			return null;
		}

		const couponMarkup = coupons.map( ( item, i ) => {
			if ( ! item.code ) {
				return null;
			}
			const meta = find( get( item, 'meta_data', [] ), { key: 'coupon_data' } );
			// In rare cases this might not exist, so we'll check before showing a link.
			const id = get( meta, 'value.id', false );
			return (
				<span key={ item.id }>
					{ id ? (
						<a
							href={ getLink( `/store/promotion/:site/c${ id }`, site ) }
							className="order-details__coupon-list-item"
						>
							{ item.code }
						</a>
					) : (
						item.code
					) }
					{ i !== coupons.length - 1 ? ', ' : '' }
				</span>
			);
		} );

		return (
			<TableRow className="order-details__coupon-list">
				<TableItem isRowHeader className="order-details__coupon-list-label">
					<h3 className="order-details__coupon-list-title">{ translate( 'Coupons' ) }</h3>
					{ couponMarkup }
				</TableItem>
				{ showTax && (
					<TableItem className="order-details__totals-tax">
						{ formatCurrency( getOrderDiscountTax( order ) * -1, order.currency ) }
					</TableItem>
				) }
				<TableItem className="order-details__totals-value">
					{ formatCurrency( parseFloat( order.discount_total ) * -1, order.currency ) }
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
					className="order-details__total-refund"
					currency={ order.currency }
					label={ translate( 'Refunded' ) }
					value={ refundValue }
					showTax={ showTax }
				/>
				<OrderTotalRow
					className="order-details__total-remaining"
					currency={ order.currency }
					label={ translate( 'Remaining total' ) }
					value={ totalValue }
					showTax={ showTax }
				/>
			</Fragment>
		);
	};

	render() {
		const { isEditing, order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const showTax = this.shouldShowTax();
		const initialShippingValue = getCurrencyFormatDecimal( order.shipping_total, order.currency );
		const currentShippingValue = getOrderShippingTotal( order );
		const refundValue = getOrderRefundTotal( order );
		const totalTaxValue = getOrderTotalTax( order );
		const totalValue = isEditing ? getOrderTotal( order ) + totalTaxValue : order.total;

		const tableClasses = classnames( {
			'order-details__table': true,
			'hide-taxes': ! showTax,
			'is-editing': isEditing,
		} );

		const totalsClasses = classnames( {
			'order-details__totals': true,
			'has-taxes': showTax,
			'has-refund': !! refundValue,
			'is-editing': isEditing,
		} );

		const emptyLines = (
			<TableRow>
				<TableItem colSpan={ isEditing ? 6 : 5 }>
					{ translate( 'There are no products on this order.' ) }
				</TableItem>
			</TableRow>
		);

		// There are line_items, and they're not all quantity: 0
		const hasLineItems = order.line_items.length && ! every( order.line_items, { quantity: 0 } );

		return (
			<div>
				<Table className={ tableClasses } header={ this.renderTableHeader() }>
					{ hasLineItems ? order.line_items.map( this.renderOrderItem ) : emptyLines }
					{ order.fee_lines.map( this.renderOrderFee ) }
				</Table>
				{ isEditing && <OrderAddItems orderId={ order.id } /> }

				<Table className={ totalsClasses } compact>
					{ this.renderCoupons() }
					<OrderTotalRow
						currency={ order.currency }
						label={ translate( 'Shipping' ) }
						initialValue={ initialShippingValue }
						value={ isNaN( currentShippingValue ) ? '' : currentShippingValue }
						taxValue={ getOrderShippingTax( order ) }
						showTax={ showTax }
						isEditable={ isEditing }
						onChange={ this.onShippingChange }
						onBlur={ this.formatShippingValue }
					/>
					<OrderTotalRow
						className="order-details__total-full"
						currency={ order.currency }
						label={ translate( 'Total' ) }
						value={ totalValue }
						taxValue={ totalTaxValue }
						showTax={ showTax }
					/>
					{ this.renderRefundTotals() }
				</Table>
				{ isEditing && this.renderTaxWarning() }
			</div>
		);
	}
}

export default localize( OrderDetailsTable );
