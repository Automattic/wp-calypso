/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flattenDeep, isEmpty, map, uniq } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ProductCard from 'components/product-card';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { extractProductSlugs, filterByProductSlugs } from './utils';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases } from 'state/purchases/selectors';

export class ProductSelector extends Component {
	constructor( props ) {
		super( props );

		const { products } = props;

		this.state = {
			...products.reduce( ( acc, product ) => {
				map( product.options, ( slugs, interval ) => {
					acc[ this.getStateKey( product.id, interval ) ] = slugs[ 0 ];
				} );
				return acc;
			}, {} ),
		};
	}

	getStateKey( productId, interval ) {
		return productId + '_' + interval;
	}

	getBillingTimeFrameLabel() {
		const { intervalType, translate } = this.props;
		switch ( intervalType ) {
			case 'monthly':
				return translate( 'per month' );
			case 'yearly':
				return translate( 'per year' );
			default:
				return '';
		}
	}

	isProductPurchased( product ) {
		const { intervalType, purchases } = this.props;
		const productSlugs = product.options[ intervalType ];

		return purchases.some( purchase => productSlugs.includes( purchase.productSlug ) );
	}

	renderProducts() {
		const { currencyCode, intervalType, products, storeProducts } = this.props;

		if ( isEmpty( storeProducts ) ) {
			return null;
		}

		return map( products, product => {
			const selectedProductSlug = this.state[ this.getStateKey( product.id, intervalType ) ];
			const productObject = storeProducts[ selectedProductSlug ];

			return (
				<ProductCard
					key={ product.id }
					title={ product.title }
					billingTimeFrame={ this.getBillingTimeFrameLabel() }
					fullPrice={ productObject.cost }
					description={ product.description }
					currencyCode={ currencyCode }
					isPurchased={ this.isProductPurchased( product ) }
				/>
			);
		} );
	}

	render() {
		const { selectedSiteId } = this.props;

		return (
			<div className="product-selector">
				<QueryProductsList />
				<QuerySitePurchases siteId={ selectedSiteId } />

				{ this.renderProducts() }
			</div>
		);
	}
}

ProductSelector.propTypes = {
	intervalType: PropTypes.string.isRequired,
	products: PropTypes.arrayOf(
		PropTypes.shape( {
			title: PropTypes.string,
			options: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ).isRequired,
		} )
	).isRequired,
	siteId: PropTypes.number,

	// Connected props
	currencyCode: PropTypes.string,
	productSlugs: PropTypes.arrayOf( PropTypes.string ),
	purchases: PropTypes.array,
	selectedSiteId: PropTypes.number,
	storeProducts: PropTypes.object,

	// From localize() HoC
	translate: PropTypes.func.isRequired,
};

export default connect( ( state, { products, siteId } ) => {
	const selectedSiteId = siteId || getSelectedSiteId( state );
	const productSlugs = uniq( flattenDeep( products.map( extractProductSlugs ) ) );
	const availableProducts = getAvailableProductsList( state );

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		productSlugs,
		purchases: getSitePurchases( state, selectedSiteId ),
		selectedSiteId,
		storeProducts: filterByProductSlugs( availableProducts, productSlugs ),
	};
} )( localize( ProductSelector ) );
