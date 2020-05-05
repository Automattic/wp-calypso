/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, uniqBy, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import { getAllProductsWithVariations } from 'woocommerce/state/sites/products/selectors';
import { getOrderItemCost } from 'woocommerce/lib/order-values/totals';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProductSearch from 'woocommerce/components/product-search';

function getExistingLineItem( item, order ) {
	const lineItems = order.line_items || [];
	const matchedItem = ! item.productId
		? { product_id: item.id }
		: { product_id: item.productId, variation_id: item.id };
	const existingLineItem = find( lineItems, matchedItem );
	if ( existingLineItem ) {
		const quantity = existingLineItem.quantity + 1;
		let subtotal = getOrderItemCost( order, existingLineItem.id ) * quantity;
		if ( 0 === subtotal ) {
			subtotal = item.price * quantity;
		}
		existingLineItem.subtotal = subtotal;
		existingLineItem.total = subtotal;
		existingLineItem.quantity = quantity;
		return existingLineItem;
	}
	return false;
}

function createLineItem( item, allProducts ) {
	const line = {
		id: uniqueId( 'product_' ),
		name: item.name || '',
		price: item.price,
		subtotal: item.price,
		total: item.price,
		quantity: 1,
	};
	// If no `productId`, this is not a variation
	if ( ! item.productId ) {
		return { ...line, product_id: item.id };
	}

	// This is a variation so name doesn't exist, and we'll pull from the base product
	const baseProduct = find( allProducts, { id: Number( item.productId ) } );
	const varName = formattedVariationName( item );
	const name = baseProduct && baseProduct.name + ' - ' + varName;

	return { ...line, name, product_id: item.productId, variation_id: item.id };
}

class OrderProductDialog extends Component {
	static propTypes = {
		allProducts: PropTypes.array.isRequired,
		isVisible: PropTypes.bool.isRequired,
		editOrder: PropTypes.func.isRequired,
		order: PropTypes.shape( {
			id: PropTypes.oneOfType( [
				PropTypes.number, // A number indicates an existing order
				PropTypes.shape( { id: PropTypes.string } ), // Placeholders have format { id: 'order_1' }
			] ).isRequired,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		products: [],
	};

	UNSAFE_componentWillUpdate( nextProps ) {
		// Dialog is being closed, clear the state
		if ( this.props.isVisible && ! nextProps.isVisible ) {
			this.setState( {
				products: [],
			} );
		}
	}

	handleChange = ( products ) => {
		this.setState( {
			products,
		} );
	};

	handleProductSave = () => {
		const { allProducts, order, siteId } = this.props;
		const products = this.state.products.map( ( p ) => {
			return find( allProducts, { id: p } );
		} );

		const lineItems = order.line_items || [];
		const newLineItems = products.map( ( item ) => {
			const existingLineItem = getExistingLineItem( item, order );
			if ( existingLineItem ) {
				return existingLineItem;
			}
			// Convert the product to the line_item format, using data from allProducts if necessary
			return createLineItem( item, allProducts );
		} );

		this.props.editOrder( siteId, {
			id: order.id,
			line_items: uniqBy( [ ...lineItems, ...newLineItems ], 'id' ),
		} );

		this.props.closeDialog();
	};

	render() {
		const { closeDialog, isVisible, translate } = this.props;
		const dialogClass = 'woocommerce order-details__dialog'; // eslint/css specificity hack

		// Fake 1 so the string is already at singular when the first item is selected
		const productsCount = this.state.products.length ? this.state.products.length : 1;
		const buttonLabel = translate( 'Add product', 'Add products', {
			count: productsCount,
		} );

		const dialogButtons = [
			<Button onClick={ closeDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.handleProductSave } disabled={ ! this.state.products.length }>
				{ buttonLabel }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				onClose={ closeDialog }
				className={ dialogClass }
				buttons={ dialogButtons }
			>
				<h1>{ translate( 'Add a product' ) }</h1>
				<p>
					{ translate(
						'Add products by searching for them. You can change the quantity after adding them.'
					) }
				</p>
				<ProductSearch onChange={ this.handleChange } value={ this.state.products } />
			</Dialog>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const order = getOrderWithEdits( state );
		const allProducts = getAllProductsWithVariations( state );

		return {
			allProducts,
			siteId,
			order,
		};
	},
	( dispatch ) => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderProductDialog ) );
