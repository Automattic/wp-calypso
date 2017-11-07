/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import formattedVariationName from 'woocommerce/lib/formatted-variation-name';
import { getAllProductsWithVariations } from 'woocommerce/state/sites/products/selectors';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import ProductSearch from 'woocommerce/components/product-search';

class OrderProductDialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		editOrder: PropTypes.func.isRequired,
		order: PropTypes.shape( {
			id: PropTypes.number.isRequired,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		products: [],
	};

	componentWillUpdate( nextProps ) {
		// Dialog is being closed, clear the state
		if ( this.props.isVisible && ! nextProps.isVisible ) {
			this.setState( {
				products: [],
			} );
		}
	}

	handleChange = products => {
		this.setState( {
			products,
		} );
	};

	handleProductSave = () => {
		const { allProducts, order, siteId } = this.props;
		const products = this.state.products.map( p => {
			return find( allProducts, { id: p } );
		} );

		const newLineItems = products.map( item => {
			// Convert the product to the line_item format
			const line = {
				id: uniqueId( 'fee_' ),
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
		} );

		const lineItems = order.line_items || [];
		this.props.editOrder( siteId, {
			id: order.id,
			line_items: [ ...lineItems, ...newLineItems ],
		} );

		this.props.closeDialog();
	};

	render() {
		const { closeDialog, isVisible, translate } = this.props;
		const dialogClass = 'woocommerce order-details__dialog'; // eslint/css specificity hack

		const dialogButtons = [
			<Button onClick={ closeDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.handleProductSave } disabled={ ! this.state.products.length }>
				{ translate( 'Add Product' ) }
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
	state => {
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
	dispatch => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderProductDialog ) );
