/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { find, findKey, flowRight as compose, includes, isEmpty, map } from 'lodash';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import PlanIntervalDiscount from 'my-sites/plan-interval-discount';
import ProductCard from 'components/product-card';
import ProductCardAction from 'components/product-card/action';
import ProductCardOptions from 'components/product-card/options';
import ProductCardPromoNudge from 'components/product-card/promo-nudge';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePurchases from 'components/data/query-site-purchases';
import ProductExpiration from 'components/product-expiration';
import { extractProductSlugs, filterByProductSlugs } from './utils';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanSlug, isRequestingSitePlans } from 'state/sites/plans/selectors';
import { getSitePurchases, isFetchingSitePurchases } from 'state/purchases/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getPlan, planHasFeature } from 'lib/plans';
import { isRequestingPlans } from 'state/plans/selectors';
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { withLocalizedMoment } from 'components/localized-moment';
import { managePurchase } from 'me/purchases/paths';

export class ProductSelector extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string,
		intervalType: PropTypes.string.isRequired,
		products: PropTypes.arrayOf(
			PropTypes.shape( {
				title: PropTypes.string,
				id: PropTypes.string,
				description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] ),
				options: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.string ) ).isRequired,
				optionDescriptions: PropTypes.objectOf(
					PropTypes.oneOfType( [ PropTypes.string, PropTypes.element, PropTypes.node ] )
				),
				optionDisplayNames: PropTypes.objectOf(
					PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] )
				),
				optionShortNames: PropTypes.objectOf(
					PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] )
				),
				optionsLabel: PropTypes.string,
			} )
		).isRequired,
		productPriceMatrix: PropTypes.shape( {
			relatedProduct: PropTypes.string,
			ratio: PropTypes.number,
		} ),
		siteId: PropTypes.number,

		// Connected props
		availableProducts: PropTypes.object,
		currencyCode: PropTypes.string,
		currentPlanSlug: PropTypes.string,
		fetchingPlans: PropTypes.bool,
		fetchingSitePlans: PropTypes.bool,
		fetchingSitePurchases: PropTypes.bool,
		productSlugs: PropTypes.arrayOf( PropTypes.string ),
		purchases: PropTypes.array,
		recordTracksEvent: PropTypes.func.isRequired,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
		storeProducts: PropTypes.object,

		// From localize() HoC
		translate: PropTypes.func.isRequired,

		// From withLocalizedMoment() HoC
		moment: PropTypes.func.isRequired,
	};

	static defaultProps = {
		productPriceMatrix: {},
	};

	constructor( props ) {
		super( props );

		const { products } = props;

		this.state = {
			...products.reduce( ( acc, product ) => {
				map( product.options, ( slugs, interval ) => {
					// Default to the last option as the selected one
					acc[ this.getStateKey( product.id, interval ) ] = slugs[ slugs.length - 1 ];
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
			purchase =>
				purchase.active &&
				( includes( productSlugs, purchase.productSlug ) ||
					includes( productSlugs, this.getRelatedYearlyProductSlug( purchase.productSlug ) ) ||
					includes( productSlugs, this.getRelatedMonthlyProductSlug( purchase.productSlug ) ) )
		);
	}

	getPurchaseByCurrentPlan() {
		const { currentPlanSlug, purchases } = this.props;

		if ( ! currentPlanSlug ) {
			return null;
		}

		return find(
			purchases,
			purchase => purchase.active && purchase.productSlug === currentPlanSlug
		);
	}

	getProductSlugByCurrentPlan() {
		const { currentPlanSlug, productSlugs } = this.props;

		if ( ! currentPlanSlug ) {
			return null;
		}

		return find( productSlugs, productSlug => planHasFeature( currentPlanSlug, productSlug ) );
	}

	getSubtitleByProduct( product ) {
		const { currentPlanSlug, moment, selectedSiteSlug, translate } = this.props;
		const currentPlan = currentPlanSlug && getPlan( currentPlanSlug );
		const currentPlanIncludesProduct = !! this.getProductSlugByCurrentPlan();

		if ( currentPlan && currentPlanIncludesProduct ) {
			return translate( 'Included in your {{planLink}}%(planName)s plan{{/planLink}}', {
				args: {
					planName: currentPlan.getTitle(),
				},
				components: {
					planLink: <a href={ `/plans/my-plan/${ selectedSiteSlug }` } />,
				},
			} );
		}

		const purchase = product ? this.getPurchaseByProduct( product ) : null;

		if ( ! purchase ) {
			return null;
		}

		const subscribedMoment = purchase.subscribedDate ? moment( purchase.subscribedDate ) : null;

		const expiryMoment = purchase.expiryDate ? moment( purchase.expiryDate ) : null;

		return (
			<ProductExpiration
				expiryDateMoment={ expiryMoment }
				purchaseDateMoment={ subscribedMoment }
				isRefundable={ purchase.isRefundable }
			/>
		);
	}

	getDescriptionByProduct( product ) {
		const { description, optionDescriptions } = product;
		const purchase = this.getPurchaseByProduct( product );

		// Description, obtained from a purchased product
		if ( purchase && optionDescriptions && optionDescriptions[ purchase.productSlug ] ) {
			return optionDescriptions[ purchase.productSlug ];
		}

		// Description, obtained from a product that's included in a purchased plan
		const planProductSlug = this.getProductSlugByCurrentPlan();
		if ( planProductSlug && optionDescriptions && optionDescriptions[ planProductSlug ] ) {
			return optionDescriptions[ planProductSlug ];
		}

		// Default product description.
		return description;
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

		// Product display name, obtained from a purchased product
		if ( purchase && optionDisplayNames && optionDisplayNames[ purchase.productSlug ] ) {
			return optionDisplayNames[ purchase.productSlug ];
		}

		// Product display name, obtained from a product that's included in a purchased plan
		const planProductSlug = this.getProductSlugByCurrentPlan();
		if ( planProductSlug && optionDisplayNames && optionDisplayNames[ planProductSlug ] ) {
			return optionDisplayNames[ planProductSlug ];
		}

		// Default product display name
		return title;
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
		const { currentPlanSlug, intervalType, selectedSiteSlug } = this.props;

		return () => {
			this.props.recordTracksEvent( 'calypso_plan_features_upgrade_click', {
				current_plan: currentPlanSlug,
				product_name: productObject.product_slug,
				billing_cycle: intervalType,
			} );
			page( '/checkout/' + selectedSiteSlug + '/' + productObject.product_slug );
		};
	};

	handleManagePurchase = productSlug => {
		return () => {
			this.props.recordTracksEvent( 'calypso_manage_purchase_click', {
				slug: productSlug,
			} );
		};
	};

	handleProductOptionSelect( stateKey, selectedProductSlug, productId ) {
		const { intervalType } = this.props;
		const relatedStateChange = {};
		const otherInterval = 'yearly' === intervalType ? 'monthly' : 'yearly';
		const relatedStateKey = this.getStateKey( productId, otherInterval );
		const relatedProductSlug =
			'yearly' === otherInterval
				? this.getRelatedYearlyProductSlug( selectedProductSlug )
				: this.getRelatedMonthlyProductSlug( selectedProductSlug );

		if ( relatedProductSlug ) {
			relatedStateChange[ relatedStateKey ] = relatedProductSlug;
		}

		this.setState( {
			[ stateKey ]: selectedProductSlug,
			// Also update the selected product option for the other interval type
			...relatedStateChange,
		} );
	}

	renderCheckoutButton( product ) {
		const { intervalType, storeProducts, translate } = this.props;
		const selectedProductSlug = this.state[ this.getStateKey( product.id, intervalType ) ];
		const productObject = storeProducts[ selectedProductSlug ];

		return (
			<ProductCardAction
				onClick={ this.handleCheckoutForProduct( productObject ) }
				intro={ this.getIntervalDiscount( selectedProductSlug ) }
				label={ translate( 'Get %(productName)s', {
					args: {
						productName: this.getProductName( product, productObject.product_slug ),
					},
				} ) }
			/>
		);
	}

	renderManageButton( purchase ) {
		const { translate } = this.props;
		const currentPlanIncludesProduct = !! this.getProductSlugByCurrentPlan();

		return (
			<ProductCardAction
				onClick={ this.handleManagePurchase( purchase.productSlug ) }
				href={ managePurchase( purchase.domain, purchase.id ) }
				label={
					! currentPlanIncludesProduct ? translate( 'Manage Product' ) : translate( 'Manage Plan' )
				}
				primary={ false }
			/>
		);
	}

	getIntervalDiscount( selectedProductSlug ) {
		const { basePlansPath, currencyCode, intervalType, siteSlug } = this.props;

		if ( ! basePlansPath ) {
			return null;
		}

		const isYearly = 'yearly' === intervalType;
		const discountedProductSlug = isYearly
			? selectedProductSlug
			: this.getRelatedYearlyProductSlug( selectedProductSlug );

		if ( ! discountedProductSlug ) {
			return null;
		}

		const discountedPrice = this.getProductOptionDiscountedPrice( discountedProductSlug );
		const fullPrice = this.getProductOptionFullPrice( discountedProductSlug );

		return (
			discountedPrice &&
			fullPrice && (
				<PlanIntervalDiscount
					basePlansPath={ basePlansPath }
					currencyCode={ currencyCode }
					discountPrice={ discountedPrice }
					isYearly={ isYearly }
					originalPrice={ fullPrice }
					siteSlug={ siteSlug }
				/>
			)
		);
	}

	getRelatedYearlyProductSlug( monthlyProductSlug ) {
		const { productPriceMatrix } = this.props;

		if ( ! productPriceMatrix ) {
			return null;
		}

		return findKey(
			productPriceMatrix,
			relatedMonthlyProduct => relatedMonthlyProduct.relatedProduct === monthlyProductSlug
		);
	}

	getRelatedMonthlyProductSlug( yearlyProductSlug ) {
		const { productPriceMatrix } = this.props;

		if ( ! productPriceMatrix || ! productPriceMatrix[ yearlyProductSlug ] ) {
			return null;
		}

		return productPriceMatrix[ yearlyProductSlug ].relatedProduct;
	}

	getPurchaseBillingTimeframe( purchase ) {
		if ( ! purchase ) {
			return null;
		}

		if ( this.getRelatedYearlyProductSlug( purchase.productSlug ) ) {
			return 'monthly';
		} else if ( this.getRelatedMonthlyProductSlug( purchase.productSlug ) ) {
			return 'yearly';
		}

		return null;
	}

	isCurrentPlanInSelectedTimeframe() {
		const { currentPlanSlug, intervalType } = this.props;
		const currentPlan = currentPlanSlug && getPlan( currentPlanSlug );

		if ( ! currentPlan ) {
			return false;
		}

		return (
			( currentPlan.term === TERM_ANNUALLY && 'yearly' === intervalType ) ||
			( currentPlan.term === TERM_MONTHLY && 'monthly' === intervalType )
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
			fetchingPlans,
			fetchingSitePlans,
			fetchingSitePurchases,
			intervalType,
			products,
			storeProducts,
			translate,
		} = this.props;

		if ( isEmpty( storeProducts ) || fetchingSitePurchases || fetchingSitePlans || fetchingPlans ) {
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

		const currentPlanIncludesProduct = !! this.getProductSlugByCurrentPlan();
		const currentPlanInSelectedTimeframe = this.isCurrentPlanInSelectedTimeframe();

		return map( products, product => {
			const stateKey = this.getStateKey( product.id, intervalType );

			let purchase, isCurrent;
			if ( currentPlanIncludesProduct ) {
				purchase = this.getPurchaseByCurrentPlan();
				isCurrent = currentPlanInSelectedTimeframe;
			} else {
				purchase = this.getPurchaseByProduct( product );
				isCurrent = this.getPurchaseBillingTimeframe( purchase ) === intervalType;
			}

			const hasProductPurchase = !! purchase;

			return (
				<ProductCard
					key={ product.id }
					title={ this.getProductDisplayName( product ) }
					description={ this.getDescriptionByProduct( product ) }
					purchase={ purchase }
					subtitle={ this.getSubtitleByProduct( product ) }
				>
					{ hasProductPurchase && isCurrent && this.renderManageButton( purchase ) }
					{ ! hasProductPurchase && ! isCurrent && (
						<Fragment>
							<ProductCardPromoNudge
								badgeText={ translate( 'Up to %(discount)s off!', {
									args: { discount: '70%' },
								} ) }
								text={ translate(
									'Hurry, these are {{strong}}Limited time introductory prices!{{/strong}}',
									{
										components: { strong: <strong /> },
									}
								) }
							/>

							<ProductCardOptions
								optionsLabel={ product.optionsLabel }
								options={ this.getProductOptions( product ) }
								selectedSlug={ this.state[ stateKey ] }
								handleSelect={ productSlug =>
									this.handleProductOptionSelect( stateKey, productSlug, product.id )
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

const connectComponent = connect(
	( state, { products, siteId } ) => {
		const selectedSiteId = siteId || getSelectedSiteId( state );
		const productSlugs = extractProductSlugs( products );
		const availableProducts = getAvailableProductsList( state );

		return {
			availableProducts,
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentPlanSlug: getSitePlanSlug( state, selectedSiteId ),
			fetchingPlans: isRequestingPlans( state ),
			fetchingSitePlans: isRequestingSitePlans( state ),
			fetchingSitePurchases: isFetchingSitePurchases( state ),
			productSlugs,
			purchases: getSitePurchases( state, selectedSiteId ),
			selectedSiteId,
			selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
			storeProducts: filterByProductSlugs( availableProducts, productSlugs ),
		};
	},
	{
		recordTracksEvent,
	}
);

export default compose( connectComponent, localize, withLocalizedMoment )( ProductSelector );
