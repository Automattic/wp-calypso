/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, flattenDeep, flowRight as compose, includes, isEmpty, map, uniq } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ProductCard from 'components/product-card';
import ProductCardOptions from 'components/product-card/options';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { extractProductSlugs, filterByProductSlugs } from './utils';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { withLocalizedMoment } from 'components/localized-moment';

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

	getPurchaseByProduct( product ) {
		const { intervalType, purchases } = this.props;
		const productSlugs = product.options[ intervalType ];

		// TODO: Implement logic for plans that contan certain Jetpack products.

		return find(
			purchases,
			purchase => purchase.active && includes( productSlugs, purchase.productSlug )
		);
	}

	getSubtitleByProduct( product ) {
		const { moment, translate } = this.props;
		const purchase = this.getPurchaseByProduct( product );

		if ( ! purchase ) {
			return;
		}

		// TODO: Implement logic for plans that contan certain Jetpack products.

		return translate( 'Purchased %(purchaseDate)s', {
			args: {
				purchaseDate: moment( purchase.subscribedDate ).format( 'YYYY-MM-DD' ),
			},
		} );
	}

	getProductOptions( product ) {
		const { intervalType, storeProducts } = this.props;
		const productSlugs = product.options[ intervalType ];

		return productSlugs.map( productSlug => {
			const productObject = storeProducts[ productSlug ];
			return {
				billingTimeFrame: this.getBillingTimeFrameLabel(),
				currencyCode: productObject.currency_code,
				fullPrice: productObject.cost,
				slug: productSlug,
				title: productObject.product_name,
			};
		} );
	}

	handleProductOptionSelect( stateKey, productSlug ) {
		this.setState( {
			[ stateKey ]: productSlug,
		} );
	}

	renderProducts() {
		const { currencyCode, intervalType, products, storeProducts } = this.props;

		if ( isEmpty( storeProducts ) ) {
			return null;
		}

		return map( products, product => {
			const selectedProductSlug = this.state[ this.getStateKey( product.id, intervalType ) ];
			const productObject = storeProducts[ selectedProductSlug ];
			const stateKey = this.getStateKey( product.id, intervalType );

			return (
				<ProductCard
					key={ product.id }
					title={ product.title }
					billingTimeFrame={ this.getBillingTimeFrameLabel() }
					fullPrice={ productObject.cost }
					description={ <p>{ product.description }</p> }
					currencyCode={ currencyCode }
					purchase={ this.getPurchaseByProduct( product ) }
					subtitle={ this.getSubtitleByProduct( product ) }
				>
					<ProductCardOptions
						optionsLabel={ product.optionsLabel }
						options={ this.getProductOptions( product ) }
						selectedSlug={ this.state[ stateKey ] }
						handleSelect={ productSlug => this.handleProductOptionSelect( stateKey, productSlug ) }
					/>
				</ProductCard>
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

	// From withLocalizedMoment() HoC
	moment: PropTypes.func.isRequired,
};

const connectComponent = connect( ( state, { products, siteId } ) => {
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
} );

export default compose(
	connectComponent,
	localize,
	withLocalizedMoment
)( ProductSelector );
