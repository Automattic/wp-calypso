/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { find, findKey, filter, flowRight as compose, includes, isEmpty, map } from 'lodash';
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/route';
import ExternalLinkWithTracking from 'components/external-link/with-tracking';
import PlanIntervalDiscount from 'my-sites/plan-interval-discount';
import ProductCard from 'components/product-card';
import ProductCardAction from 'components/product-card/action';
import ProductCardOptions from 'components/product-card/options';
import ProductCardPromoNudge from 'components/product-card/promo-nudge';
import QuerySiteProducts from 'components/data/query-site-products';
import QuerySitePurchases from 'components/data/query-site-purchases';
import QueryProductsList from 'components/data/query-products-list';
import ProductExpiration from 'components/product-expiration';
import { extractProductSlugs, filterByProductSlugs } from './utils';
import { getAvailableProductsBySiteId } from 'state/sites/products/selectors';
import { getAvailableProductsList, isProductsListFetching } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanSlug, isRequestingSitePlans } from 'state/sites/plans/selectors';
import { getSitePurchases, isFetchingSitePurchases } from 'state/purchases/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getPlan, planHasFeature } from 'lib/plans';
import { isExpiring } from 'lib/purchases';
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
				optionShortNamesCallback: PropTypes.func,
				optionActionButtonNames: PropTypes.objectOf(
					PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] )
				),
				optionsLabel: PropTypes.string,
				optionsLabelCallback: PropTypes.func,
			} )
		).isRequired,
		productPriceMatrix: PropTypes.shape( {
			relatedProduct: PropTypes.string,
			ratio: PropTypes.number,
		} ),
		siteId: PropTypes.number,
		onUpgradeClick: PropTypes.func,

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

	getProductSlugsForCurrentPlan() {
		const { currentPlanSlug, productSlugs } = this.props;
		return ! currentPlanSlug
			? null
			: filter( productSlugs, productSlug => planHasFeature( currentPlanSlug, productSlug ) );
	}

	currentPlanIncludesProduct( product ) {
		const { currentPlanSlug } = this.props;
		const productSlugs = this.getProductSlugsForCurrentPlan();
		return ! currentPlanSlug || ! productSlugs
			? false
			: productSlugs.some( slug => product.slugs.includes( slug ) );
	}

	getProductSlugByCurrentPlan( product ) {
		return ! this.props.currentPlanSlug
			? null
			: find( product.slugs, slug => planHasFeature( this.props.currentPlanSlug, slug ) );
	}

	getSubtitleByProduct( product ) {
		const { currentPlanSlug, moment, selectedSiteSlug, translate } = this.props;
		const currentPlan = currentPlanSlug && getPlan( currentPlanSlug );

		if ( currentPlan && this.currentPlanIncludesProduct( product ) ) {
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

		const renewDateMoment =
			! isExpiring( purchase ) && purchase.renewDate ? moment( purchase.renewDate ) : null;

		return (
			<ProductExpiration
				expiryDateMoment={ expiryMoment }
				renewDateMoment={ renewDateMoment }
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
		const planProductSlug = this.getProductSlugByCurrentPlan( product );
		if ( planProductSlug && optionDescriptions && optionDescriptions[ planProductSlug ] ) {
			return optionDescriptions[ planProductSlug ];
		}

		// Default product description.
		return description;
	}

	getActionButtonName( product, productSlug ) {
		if ( product.optionActionButtonNames && product.optionActionButtonNames[ productSlug ] ) {
			return product.optionActionButtonNames[ productSlug ];
		}

		return this.getProductName( product, productSlug );
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

		if ( product.optionShortNamesCallback ) {
			const productName = product.optionShortNamesCallback( productObject );
			if ( productName ) {
				return productName;
			}
		}

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
		const planProductSlug = this.getProductSlugByCurrentPlan( product );
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
		const { currentPlanSlug, intervalType, selectedSiteSlug, onUpgradeClick } = this.props;

		return () => {
			this.props.recordTracksEvent( 'calypso_plan_features_upgrade_click', {
				current_plan: currentPlanSlug,
				product_name: productObject.product_slug,
				billing_cycle: intervalType,
			} );
			if ( onUpgradeClick ) {
				onUpgradeClick( productObject );
				return;
			}
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
						productName: this.getActionButtonName( product, productObject.product_slug ),
					},
				} ) }
			/>
		);
	}

	renderManageButton( product, purchase ) {
		return (
			<ProductCardAction
				onClick={ this.handleManagePurchase( purchase.productSlug ) }
				href={ managePurchase( purchase.domain, purchase.id ) }
				label={
					this.currentPlanIncludesProduct( product )
						? this.props.translate( 'Manage Plan' )
						: this.props.translate( 'Manage Product' )
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
			selectedSiteSlug,
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

		const currentPlanInSelectedTimeframe = this.isCurrentPlanInSelectedTimeframe();

		return map( products, product => {
			const stateKey = this.getStateKey( product.id, intervalType );
			const selectedSlug = this.state[ stateKey ];
			const productObject = storeProducts[ selectedSlug ];

			const linkUrl = selectedSiteSlug
				? addQueryArgs( { site: selectedSiteSlug }, product.link.url )
				: product.link.url;

			let purchase, isCurrent;
			if ( this.currentPlanIncludesProduct( product ) ) {
				purchase = this.getPurchaseByCurrentPlan();
				isCurrent = currentPlanInSelectedTimeframe;
			} else {
				purchase = this.getPurchaseByProduct( product );
				isCurrent = this.getPurchaseBillingTimeframe( purchase ) === intervalType;
			}

			const hasProductPurchase = !! purchase;

			let optionsLabel;
			if ( product.optionsLabel ) {
				optionsLabel = product.optionsLabel;
			} else if ( product.optionsLabelCallback ) {
				optionsLabel = product.optionsLabelCallback( productObject );
			}

			return (
				<ProductCard
					key={ product.id }
					title={ this.getProductDisplayName( product ) }
					description={
						<Fragment>
							{ this.getDescriptionByProduct( product ) }
							{ product.link && ' ' }
							{ product.link && (
								<ExternalLinkWithTracking
									href={ linkUrl }
									tracksEventName="calypso_plan_link_click"
									tracksEventProps={ {
										link_location: product.link.props.location,
										link_slug: product.link.props.slug,
									} }
									icon
								>
									{ product.link.label }
								</ExternalLinkWithTracking>
							) }
						</Fragment>
					}
					purchase={ purchase }
					subtitle={ this.getSubtitleByProduct( product ) }
				>
					{ hasProductPurchase && isCurrent && this.renderManageButton( product, purchase ) }
					{ ! hasProductPurchase && ! isCurrent && (
						<Fragment>
							{ product.hasPromo && (
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
							) }

							<ProductCardOptions
								optionsLabel={ optionsLabel }
								options={ this.getProductOptions( product ) }
								selectedSlug={ selectedSlug }
								handleSelect={ productSlug =>
									this.handleProductOptionSelect( stateKey, productSlug, product.id )
								}
								forceRadiosEvenIfOnlyOneOption={ !! product.forceRadios }
							/>

							{ this.renderCheckoutButton( product ) }
						</Fragment>
					) }
				</ProductCard>
			);
		} );
	}

	render() {
		const { selectedSiteId, isConnectStore } = this.props;

		return (
			<div className="product-selector">
				<QuerySiteProducts siteId={ selectedSiteId } />
				{ isConnectStore ? (
					<QueryProductsList />
				) : (
					<QuerySitePurchases siteId={ selectedSiteId } />
				) }
				{ this.renderProducts() }
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { products, siteId, basePlansPath } ) => {
		const selectedSiteId = siteId || getSelectedSiteId( state );
		const productSlugs = extractProductSlugs( products );

		const isConnectStore = basePlansPath && '/jetpack/connect/store' === basePlansPath;
		const availableProducts = isConnectStore
			? getAvailableProductsList( state )
			: getAvailableProductsBySiteId( state, selectedSiteId ).data;

		const isFetchingPurchases = isConnectStore
			? isProductsListFetching( state )
			: isFetchingSitePurchases( state );

		return {
			isConnectStore,
			availableProducts,
			currencyCode: getCurrentUserCurrencyCode( state ),
			currentPlanSlug: getSitePlanSlug( state, selectedSiteId ),
			fetchingPlans: isRequestingPlans( state ),
			fetchingSitePlans: isRequestingSitePlans( state ),
			fetchingSitePurchases: isFetchingPurchases,
			productSlugs,
			purchases: getSitePurchases( state, selectedSiteId ),
			selectedSiteId,
			selectedSiteSlug: getSiteSlug( state, selectedSiteId ),
			storeProducts: isEmpty( availableProducts )
				? {}
				: filterByProductSlugs( availableProducts, productSlugs ),
		};
	},
	{
		recordTracksEvent,
	}
);

export default compose( connectComponent, localize, withLocalizedMoment )( ProductSelector );
