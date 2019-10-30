/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { find, flowRight as compose, includes, isEmpty, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ProductCard from 'components/product-card';
import ProductCardAction from 'components/product-card/action';
import ProductCardOptions from 'components/product-card/options';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { extractProductSlugs, filterByProductSlugs } from './utils';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePurchases, isFetchingSitePurchases } from 'state/purchases/selectors';
import { getSiteSlug } from 'state/sites/selectors';
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

		return translate( 'Purchased %(purchaseDate)s', {
			args: {
				purchaseDate: moment( purchase.subscribedDate ).format( 'YYYY-MM-DD' ),
			},
		} );
	}

	getDescriptionByProduct( product ) {
		const { description, optionDescriptions } = product;
		const purchase = this.getPurchaseByProduct( product );

		if ( ! purchase || ! optionDescriptions || ! optionDescriptions[ purchase.productSlug ] ) {
			return description;
		}

		return optionDescriptions[ purchase.productSlug ];
	}

	getProductName( product, productSlug ) {
		if ( product.optionShortNames && product.optionShortNames[ productSlug ] ) {
			return product.optionShortNames[ productSlug ];
		}

		const { storeProducts } = this.props;
		if ( ! storeProducts ) {
			return null;
		}

		const productObject = storeProducts[ productSlug ];

		return productObject.product_name;
	}

	getProductDisplayName( product ) {
		const { title, optionDisplayNames } = product;
		const purchase = this.getPurchaseByProduct( product );

		if ( ! purchase ) {
			return title;
		}

		if ( ! optionDisplayNames || ! optionDisplayNames[ purchase.productSlug ] ) {
			return title;
		}

		return optionDisplayNames[ purchase.productSlug ];
	}

	getProductOptions( product ) {
		const { intervalType, storeProducts } = this.props;
		const productSlugs = product.options[ intervalType ];

		return productSlugs.map( productSlug => {
			const productObject = storeProducts[ productSlug ];

			return {
				billingTimeFrame: this.getBillingTimeFrameLabel(),
				currencyCode: productObject.currency_code,
				fullPrice: this.getProductOptionFullPrice( productSlug ),
				discountedPrice: this.getProductOptionDiscountedPrice( productSlug ),
				slug: productSlug,
				title: this.getProductName( product, productSlug ),
			};
		} );
	}

	handleCheckoutForProduct = productObject => {
		const { selectedSiteSlug } = this.props;

		return () => {
			page( '/checkout/' + selectedSiteSlug + '/' + productObject.product_slug );
		};
	};

	handleProductOptionSelect( stateKey, productSlug ) {
		this.setState( {
			[ stateKey ]: productSlug,
		} );
	}

	renderCheckoutButton( product ) {
		const { intervalType, storeProducts, translate } = this.props;
		const selectedProductSlug = this.state[ this.getStateKey( product.id, intervalType ) ];
		const productObject = storeProducts[ selectedProductSlug ];

		return (
			<ProductCardAction
				onClick={ this.handleCheckoutForProduct( productObject ) }
				label={ translate( 'Get %(productName)s', {
					args: {
						productName: this.getProductName( product, productObject.product_slug ),
					},
				} ) }
			/>
		);
	}

	getProductOptionFullPrice( productSlug ) {
		const { productPriceMatrix, storeProducts } = this.props;

		if ( isEmpty( storeProducts ) ) {
			return null;
		}

		const productObject = storeProducts[ productSlug ];
		const relatedProductObject = productPriceMatrix[ productSlug ];

		if ( relatedProductObject ) {
			return storeProducts[ relatedProductObject.relatedProduct ].cost * relatedProductObject.ratio;
		}

		return productObject.cost;
	}

	getProductOptionDiscountedPrice( productSlug ) {
		const { productPriceMatrix, storeProducts } = this.props;

		if ( isEmpty( storeProducts ) ) {
			return null;
		}

		const productObject = storeProducts[ productSlug ];
		const relatedProductObject = productPriceMatrix[ productSlug ];

		if ( relatedProductObject ) {
			return productObject.cost;
		}

		return null;
	}

	renderProducts() {
		const {
			currencyCode,
			fetchingSitePurchases,
			intervalType,
			products,
			storeProducts,
		} = this.props;

		if ( isEmpty( storeProducts ) || fetchingSitePurchases ) {
			return map( products, product => {
				return (
					<ProductCard
						key={ product.id }
						title={ product.title }
						isPlaceholder={ true }
						description={ product.description ? product.description : null }
					/>
				);
			} );
		}

		return map( products, product => {
			const selectedProductSlug = this.state[ this.getStateKey( product.id, intervalType ) ];
			const stateKey = this.getStateKey( product.id, intervalType );
			const purchase = this.getPurchaseByProduct( product );

			return (
				<ProductCard
					key={ product.id }
					title={ this.getProductDisplayName( product ) }
					billingTimeFrame={ this.getBillingTimeFrameLabel() }
					fullPrice={ this.getProductOptionFullPrice( selectedProductSlug ) }
					discountedPrice={ this.getProductOptionDiscountedPrice( selectedProductSlug ) }
					description={ this.getDescriptionByProduct( product ) }
					currencyCode={ currencyCode }
					purchase={ purchase }
					subtitle={ this.getSubtitleByProduct( product ) }
				>
					{ ! purchase && (
						<Fragment>
							<ProductCardOptions
								optionsLabel={ product.optionsLabel }
								options={ this.getProductOptions( product ) }
								selectedSlug={ this.state[ stateKey ] }
								handleSelect={ productSlug =>
									this.handleProductOptionSelect( stateKey, productSlug )
								}
							/>

							{ this.renderCheckoutButton( product ) }
						</Fragment>
					) }
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
			id: PropTypes.string,
			description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
			options: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ).isRequired,
			optionDescriptions: PropTypes.objectOf( [ PropTypes.string, PropTypes.element ] ),
			optionsLabel: PropTypes.string,
		} )
	).isRequired,
	productPriceMatrix: PropTypes.shape( {
		relatedProduct: PropTypes.string,
		ratio: PropTypes.number,
	} ),
	siteId: PropTypes.number,

	// Connected props
	currencyCode: PropTypes.string,
	fetchingSitePurchases: PropTypes.bool,
	productSlugs: PropTypes.arrayOf( PropTypes.string ),
	purchases: PropTypes.array,
	selectedSiteId: PropTypes.number,
	storeProducts: PropTypes.object,

	// From localize() HoC
	translate: PropTypes.func.isRequired,

	// From withLocalizedMoment() HoC
	moment: PropTypes.func.isRequired,
};

ProductSelector.defaultProps = {
	productPriceMatrix: {},
};

const connectComponent = connect( ( state, { products, siteId } ) => {
	const selectedSiteId = siteId || getSelectedSiteId( state );
	const productSlugs = extractProductSlugs( products );
	const availableProducts = getAvailableProductsList( state );

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		fetchingSitePurchases: isFetchingSitePurchases( state ),
		productSlugs,
		purchases: getSitePurchases( state, selectedSiteId ),
		selectedSiteId,
		selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
		storeProducts: filterByProductSlugs( availableProducts, productSlugs ),
	};
} );

export default compose(
	connectComponent,
	localize,
	withLocalizedMoment
)( ProductSelector );
