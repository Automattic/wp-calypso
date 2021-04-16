/**
 * External dependencies
 */
import classNames from 'classnames';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { compact, get, findIndex, last, map, reduce } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import FoldableCard from 'calypso/components/foldable-card';
import Notice from 'calypso/components/notice';
import PlanFeaturesActions from './actions';
import PlanFeaturesHeader from './header';
import PlanFeaturesItem from './item';
import SpinnerLine from 'calypso/components/spinner-line';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import { abtest } from 'calypso/lib/abtest';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import {
	getPlan,
	getPlanBySlug,
	getPlanRawPrice,
	getPlanSlug,
	getDiscountedRawPrice,
} from 'calypso/state/plans/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getDiscountByName } from 'calypso/lib/discounts';
import { addQueryArgs } from 'calypso/lib/url';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
	getPlansBySiteId,
	isCurrentUserCurrentPlanOwner,
} from 'calypso/state/sites/plans/selectors';
import {
	getSitePlan,
	getSiteSlug,
	isCurrentPlanPaid,
	isCurrentSitePlan,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import {
	isBestValue,
	isMonthly,
	isNew,
	PLAN_FREE,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	GROUP_WPCOM,
	FEATURE_BUSINESS_ONBOARDING,
	TYPE_P2_PLUS,
	TYPE_FREE,
	planMatches,
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getPlanPath,
	isFreePlan,
	isWpComEcommercePlan,
	isWpComBusinessPlan,
	getPlanClass,
	FEATURE_CUSTOM_DOMAIN,
} from '@automattic/calypso-products';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import PlanFeaturesScroller from './scroller';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { getProductsList } from 'calypso/state/products-list/selectors';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';

/**
 * Style dependencies
 */
import './style.scss';

const noop = () => {};

export class PlanFeatures extends Component {
	isMounted = false;

	componentWillUnmount() {
		this.isMounted = false;
	}

	componentDidMount() {
		this.isMounted = true;
	}

	render() {
		const { isInSignup, planProperties, plans, selectedPlan, withScroll, translate } = this.props;
		const tableClasses = classNames(
			'plan-features__table',
			`has-${ planProperties.length }-cols`
		);
		const planClasses = classNames( 'plan-features', {
			'plan-features--signup': isInSignup,
		} );
		const planWrapperClasses = classNames( {
			'plans-wrapper': isInSignup,
		} );
		const mobileView = ! withScroll && (
			<div className="plan-features__mobile">{ this.renderMobileView() }</div>
		);
		let planDescriptions;
		let bottomButtons = null;

		if ( withScroll || ! isInSignup ) {
			planDescriptions = <tr>{ this.renderPlanDescriptions() }</tr>;

			bottomButtons = <tr>{ this.renderBottomButtons() }</tr>;
		}

		const initialSelectedIndex = selectedPlan
			? plans.indexOf( selectedPlan )
			: findIndex( planProperties, { popular: true } );

		return (
			<div className={ planWrapperClasses }>
				<QueryActivePromotions />
				<div className={ planClasses }>
					{ this.renderNotice() }
					<div ref={ this.contentRef } className="plan-features__content">
						{ mobileView }
						<PlanFeaturesScroller
							withScroll={ withScroll }
							planCount={ planProperties.length }
							cellSelector=".plan-features__table-item"
							initialSelectedIndex={ initialSelectedIndex }
						>
							<table className={ tableClasses }>
								<caption className="plan-features__screen-reader-text screen-reader-text">
									{ translate( 'Available plans to choose from' ) }
								</caption>
								<tbody>
									<tr>{ this.renderPlanHeaders() }</tr>
									{ ! withScroll && planDescriptions }
									<tr>{ this.renderTopButtons() }</tr>
									{ withScroll && planDescriptions }
									{ this.renderPlanFeatureRows() }
									{ ! withScroll && ! isInSignup && bottomButtons }
								</tbody>
							</table>
						</PlanFeaturesScroller>
					</div>
				</div>
			</div>
		);
	}

	renderNotice() {
		return (
			this.renderUpgradeDisabledNotice() || this.renderDiscountNotice() || this.renderCreditNotice()
		);
	}

	renderDiscountNotice() {
		if ( ! this.hasDiscountNotice() ) {
			return false;
		}

		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}
		const activeDiscount = getDiscountByName( this.props.withDiscount, this.props.discountEndDate );
		return ReactDOM.createPortal(
			<Notice
				className="plan-features__notice-credits"
				showDismiss={ false }
				icon="info-outline"
				status="is-success"
			>
				{ activeDiscount.plansPageNoticeTextTitle && (
					<strong>
						{ activeDiscount.plansPageNoticeTextTitle }
						{ <br /> }
					</strong>
				) }
				{ activeDiscount.plansPageNoticeText }
			</Notice>,
			bannerContainer
		);
	}

	hasDiscountNotice() {
		const { canPurchase, hasPlaceholders, withDiscount, discountEndDate } = this.props;
		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}

		const activeDiscount = getDiscountByName( withDiscount, discountEndDate );
		if ( ! activeDiscount || hasPlaceholders || ! canPurchase ) {
			return false;
		}

		return true;
	}

	higherPlanAvailable() {
		const currentPlan = get( this.props, 'sitePlan.product_slug', '' );
		const highestPlan = last( this.props.planProperties );
		return currentPlan !== highestPlan.planName && highestPlan.availableForPurchase;
	}

	renderCreditNotice() {
		const {
			canPurchase,
			hasPlaceholders,
			translate,
			planCredits,
			planProperties,
			showPlanCreditsApplied,
		} = this.props;
		const bannerContainer = this.getBannerContainer();
		if (
			hasPlaceholders ||
			! canPurchase ||
			! bannerContainer ||
			! showPlanCreditsApplied ||
			! planCredits ||
			! this.higherPlanAvailable()
		) {
			return null;
		}

		return ReactDOM.createPortal(
			<Notice
				className="plan-features__notice-credits"
				showDismiss={ false }
				icon="info-outline"
				status="is-success"
			>
				{ translate(
					'You have {{b}}%(amountInCurrency)s{{/b}} of pro-rated credits available from your current plan. ' +
						'Apply those credits towards an upgrade before they expire!',
					{
						args: {
							amountInCurrency: formatCurrency( planCredits, planProperties[ 0 ].currencyCode ),
						},
						components: {
							b: <strong />,
						},
					}
				) }
			</Notice>,
			bannerContainer
		);
	}

	getBannerContainer() {
		return document.querySelector( '.plans-features-main__notice' );
	}

	renderUpgradeDisabledNotice() {
		const { canPurchase, hasPlaceholders, translate } = this.props;

		if ( hasPlaceholders || canPurchase ) {
			return null;
		}

		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return false;
		}
		return ReactDOM.createPortal(
			<Notice className="plan-features__notice" showDismiss={ false } status="is-info">
				{ translate(
					'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.'
				) }
			</Notice>,
			bannerContainer
		);
	}

	renderMobileView() {
		const {
			redirectToAddDomainFlow,
			basePlansPath,
			canPurchase,
			isInSignup,
			isLandingPage,
			isJetpack,
			planProperties,
			selectedPlan,
			translate,
			showPlanCreditsApplied,
			isLaunchPage,
			isInVerticalScrollingPlansExperiment,
		} = this.props;

		// move any free plan to last place in mobile view
		let freePlanProperties;
		const reorderedPlans = planProperties.filter( ( properties ) => {
			if ( isFreePlan( properties.planName ) ) {
				freePlanProperties = properties;
				return false;
			}
			return true;
		} );

		if ( freePlanProperties ) {
			reorderedPlans.push( freePlanProperties );
		}

		let buttonText = null;
		let forceDisplayButton = false;

		if ( redirectToAddDomainFlow ) {
			buttonText = translate( 'Add to Cart' );
			forceDisplayButton = true;
		}

		return map( reorderedPlans, ( properties ) => {
			const {
				availableForPurchase,
				currencyCode,
				current,
				features,
				planConstantObj,
				planName,
				popular,
				newPlan,
				bestValue,
				relatedMonthlyPlan,
				primaryUpgrade,
				isPlaceholder,
				hideMonthly,
			} = properties;
			const { rawPrice, discountPrice, isMonthlyPlan } = properties;
			const planDescription = isInVerticalScrollingPlansExperiment
				? planConstantObj.getShortDescription( abtest )
				: planConstantObj.getDescription( abtest );
			return (
				<div className="plan-features__mobile-plan" key={ planName }>
					<PlanFeaturesHeader
						availableForPurchase={ availableForPurchase }
						current={ current }
						currencyCode={ currencyCode }
						isJetpack={ isJetpack }
						popular={ popular }
						newPlan={ newPlan }
						bestValue={ bestValue }
						title={ planConstantObj.getTitle() }
						planType={ planName }
						rawPrice={ rawPrice }
						discountPrice={ discountPrice }
						billingTimeFrame={ planConstantObj.getBillingTimeFrame() }
						hideMonthly={ hideMonthly }
						isPlaceholder={ isPlaceholder }
						basePlansPath={ basePlansPath }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						displayPerMonthNotation={ isInSignup }
						selectedPlan={ selectedPlan }
						showPlanCreditsApplied={ true === showPlanCreditsApplied && ! this.hasDiscountNotice() }
						isMonthlyPlan={ isMonthlyPlan }
						audience={ planConstantObj.getAudience() }
						isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
						isLoggedInMonthlyPricing={ this.props.isLoggedInMonthlyPricing }
						isInSignup={ isInSignup }
					/>
					<p className="plan-features__description">{ planDescription }</p>
					<PlanFeaturesActions
						availableForPurchase={ availableForPurchase }
						forceDisplayButton={ forceDisplayButton }
						buttonText={ buttonText }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
						selectedPlan={ selectedPlan }
					/>
					<FoldableCard header={ translate( 'Show features' ) } clickableHeader compact>
						{ this.renderMobileFeatures( features ) }
					</FoldableCard>
				</div>
			);
		} );
	}

	renderMobileFeatures( features ) {
		return map( features, ( currentFeature, index ) => {
			return currentFeature ? this.renderFeatureItem( currentFeature, index ) : null;
		} );
	}

	renderPlanHeaders() {
		const {
			basePlansPath,
			disableBloggerPlanWithNonBlogDomain,
			displayJetpackPlans,
			isInSignup,
			isJetpack,
			planProperties,
			selectedPlan,
			siteType,
			showPlanCreditsApplied,
			withScroll,
			isInVerticalScrollingPlansExperiment,
		} = this.props;

		return map( planProperties, ( properties ) => {
			const {
				availableForPurchase,
				currencyCode,
				current,
				planConstantObj,
				planName,
				popular,
				newPlan,
				bestValue,
				relatedMonthlyPlan,
				isPlaceholder,
				hideMonthly,
				rawPrice,
				isMonthlyPlan,
			} = properties;
			let { discountPrice } = properties;
			const classes = classNames( 'plan-features__table-item', 'has-border-top' );
			let audience = planConstantObj.getAudience();
			let billingTimeFrame = planConstantObj.getBillingTimeFrame();

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					discountPrice = 0;
				}
			}

			if ( isInSignup && ! displayJetpackPlans ) {
				switch ( siteType ) {
					case 'blog':
						audience = planConstantObj.getBlogAudience();
						break;
					case 'grid':
						audience = planConstantObj.getPortfolioAudience();
						break;
					case 'store':
						audience = planConstantObj.getStoreAudience();
						break;
					default:
						audience = planConstantObj.getAudience();
				}
			}

			if ( isInSignup && displayJetpackPlans ) {
				billingTimeFrame = planConstantObj.getSignupBillingTimeFrame();
			}

			return (
				<th scope="col" key={ planName } className={ classes }>
					<PlanFeaturesHeader
						audience={ audience }
						availableForPurchase={ availableForPurchase }
						basePlansPath={ basePlansPath }
						billingTimeFrame={ billingTimeFrame }
						current={ current }
						currencyCode={ currencyCode }
						discountPrice={ discountPrice }
						hideMonthly={ hideMonthly }
						isInSignup={ isInSignup }
						isJetpack={ isJetpack }
						isPlaceholder={ isPlaceholder }
						newPlan={ newPlan }
						bestValue={ bestValue }
						planType={ planName }
						popular={ popular }
						rawPrice={ rawPrice }
						relatedMonthlyPlan={ relatedMonthlyPlan }
						selectedPlan={ selectedPlan }
						showPlanCreditsApplied={ true === showPlanCreditsApplied && ! this.hasDiscountNotice() }
						title={ planConstantObj.getTitle() }
						plansWithScroll={ withScroll }
						isMonthlyPlan={ isMonthlyPlan }
						isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
						isLoggedInMonthlyPricing={
							! isInSignup && ! isJetpack && this.props.kindOfPlanTypeSelector === 'interval'
						}
					/>
				</th>
			);
		} );
	}

	renderPlanDescriptions() {
		const { planProperties, withScroll } = this.props;

		return map( planProperties, ( properties ) => {
			const { planName, planConstantObj, isPlaceholder } = properties;

			const classes = classNames( 'plan-features__table-item', {
				'is-placeholder': isPlaceholder,
				'is-description': withScroll,
			} );

			let description = null;
			if ( withScroll ) {
				description = planConstantObj.getShortDescription( abtest );
			} else {
				description = planConstantObj.getDescription( abtest );
			}

			return (
				<td key={ planName } className={ classes }>
					{ isPlaceholder ? <SpinnerLine /> : null }

					<p className="plan-features__description">{ description }</p>
				</td>
			);
		} );
	}

	handleUpgradeClick( singlePlanProperties ) {
		const {
			isInSignup,
			onUpgradeClick: ownPropsOnUpgradeClick,
			redirectTo,
			displayJetpackPlans,
			withDiscount,
			selectedSiteSlug,
			shoppingCartManager,
			redirectToAddDomainFlow,
			productsList,
		} = this.props;

		const {
			availableForPurchase,
			cartItemForPlan,
			siteIsPrivateAndGoingAtomic,
			planName,
			productSlug,
		} = singlePlanProperties;

		if ( ownPropsOnUpgradeClick && ownPropsOnUpgradeClick !== noop && cartItemForPlan ) {
			ownPropsOnUpgradeClick( cartItemForPlan );
			return;
		}

		if ( ! availableForPurchase ) {
			return;
		}

		if ( siteIsPrivateAndGoingAtomic && isInSignup ) {
			// Let signup do its thing
			return;
		}

		if ( redirectToAddDomainFlow ) {
			// In this flow, we add the product to the cart directly and then
			// redirect to the "add a domain" page.
			shoppingCartManager
				.addProductsToCart( [
					fillInSingleCartItemAttributes(
						{
							product_slug: productSlug,
							extra: {
								afterPurchaseUrl: redirectTo ?? undefined,
							},
						},
						productsList
					),
				] )
				.then( () => {
					if ( ! displayJetpackPlans && withDiscount && this.isMounted ) {
						return shoppingCartManager.applyCoupon( withDiscount );
					}
				} )
				.then( () => {
					this.isMounted && page( `/domains/add/${ selectedSiteSlug }` );
				} );
			return;
		}

		const planPath = getPlanPath( planName ) || '';
		const checkoutUrlArgs = {};
		// Auto-apply the coupon code to the cart for WPCOM sites
		if ( ! displayJetpackPlans && withDiscount ) {
			checkoutUrlArgs.coupon = withDiscount;
		}
		if ( redirectTo ) {
			checkoutUrlArgs.redirect_to = redirectTo;
		}
		const checkoutUrlWithArgs = addQueryArgs(
			checkoutUrlArgs,
			`/checkout/${ selectedSiteSlug }/${ planPath }`
		);

		page( checkoutUrlWithArgs );
	}

	renderTopButtons() {
		const {
			canPurchase,
			disableBloggerPlanWithNonBlogDomain,
			isInSignup,
			isLandingPage,
			isLaunchPage,
			planProperties,
			selectedPlan,
			selectedSiteSlug,
			purchaseId,
			translate,
		} = this.props;

		return map( planProperties, ( properties ) => {
			let { availableForPurchase } = properties;
			const {
				current,
				planName,
				primaryUpgrade,
				isPlaceholder,
				planConstantObj,
				popular,
			} = properties;

			const classes = classNames(
				'plan-features__table-item',
				'has-border-bottom',
				'is-top-buttons'
			);

			let forceDisplayButton = false;
			let buttonText = null;

			if ( this.props.redirectToAddDomainFlow ) {
				buttonText = translate( 'Add to Cart' );
				forceDisplayButton = true;
			}

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					availableForPurchase = false;
					forceDisplayButton = true;
					buttonText = translate( 'Only with .blog domains' );
				}
			}

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
						availableForPurchase={ availableForPurchase }
						buttonText={ buttonText }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						forceDisplayButton={ forceDisplayButton }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
						manageHref={
							purchaseId
								? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
								: `/plans/my-plan/${ selectedSiteSlug }`
						}
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
						selectedPlan={ selectedPlan }
					/>
				</td>
			);
		} );
	}

	getLongestFeaturesList() {
		const { planProperties } = this.props;

		return reduce(
			planProperties,
			( longest, properties ) => {
				const currentFeatures = Object.keys( properties.features );
				return currentFeatures.length > longest.length ? currentFeatures : longest;
			},
			[]
		);
	}

	renderPlanFeatureRows() {
		const longestFeatures = this.getLongestFeaturesList();
		return map( longestFeatures, ( featureKey, rowIndex ) => {
			return (
				<tr key={ rowIndex } className="plan-features__row">
					{ this.renderPlanFeatureColumns( rowIndex ) }
				</tr>
			);
		} );
	}

	renderAnnualPlansFeatureNotice( feature ) {
		const { translate, isInSignup } = this.props;

		if ( ! isInSignup || ! feature.availableOnlyForAnnualPlans ) {
			return null;
		}

		return (
			<span className="plan-features__item-annual-plan">
				{ translate( 'Included with annual plans' ) }
			</span>
		);
	}

	renderFeatureItem( feature, index ) {
		const description = feature.getDescription
			? feature.getDescription( abtest, this.props.domainName )
			: null;
		const classes = classNames( 'plan-features__item-info', {
			'is-annual-plan-feature': feature.availableOnlyForAnnualPlans,
			'is-available': feature.availableForCurrentPlan,
		} );

		return (
			<PlanFeaturesItem
				key={ index }
				description={ description }
				hideInfoPopover={ feature.hideInfoPopover }
				hideGridicon={ this.props.isReskinned ? false : this.props.withScroll }
				availableForCurrentPlan={ feature.availableForCurrentPlan }
			>
				<span className={ classes }>
					{ this.renderAnnualPlansFeatureNotice( feature ) }
					<span className="plan-features__item-title">{ feature.getTitle() }</span>
				</span>
			</PlanFeaturesItem>
		);
	}

	renderPlanFeatureColumns( rowIndex ) {
		const { planProperties, selectedFeature, withScroll, hideCustomDomainFeature } = this.props;

		return map( planProperties, ( properties ) => {
			const { features, planName } = properties;

			const featureKeys = Object.keys( features );
			const key = featureKeys[ rowIndex ];
			let currentFeature = features[ key ];

			if ( hideCustomDomainFeature && FEATURE_CUSTOM_DOMAIN === currentFeature?.getSlug() ) {
				currentFeature = null;
			}

			const classes = classNames( 'plan-features__table-item', getPlanClass( planName ), {
				'has-partial-border': ! withScroll && rowIndex + 1 < featureKeys.length,
				'is-last-feature': rowIndex + 1 === featureKeys.length,
				'is-highlighted':
					selectedFeature && currentFeature && selectedFeature === currentFeature.getSlug(),
			} );

			return currentFeature ? (
				<td key={ `${ planName }-${ key }` } className={ classes }>
					{ this.renderFeatureItem( currentFeature ) }
				</td>
			) : (
				<td key={ `${ planName }-none` } className="plan-features__table-item" />
			);
		} );
	}

	renderBottomButtons() {
		const {
			canPurchase,
			disableBloggerPlanWithNonBlogDomain,
			isInSignup,
			isLandingPage,
			isLaunchPage,
			planProperties,
			selectedPlan,
			selectedSiteSlug,
			purchaseId,
		} = this.props;

		return map( planProperties, ( properties ) => {
			let { availableForPurchase } = properties;
			const {
				current,
				planName,
				primaryUpgrade,
				isPlaceholder,
				planConstantObj,
				popular,
			} = properties;
			const classes = classNames(
				'plan-features__table-item',
				'has-border-bottom',
				'is-bottom-buttons'
			);

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					availableForPurchase = false;
				}
			}

			let buttonText;
			let forceDisplayButton = false;

			if ( this.props.redirectToAddDomainFlow ) {
				buttonText = this.props.translate( 'Add to Cart' );
				forceDisplayButton = true;
			}

			return (
				<td key={ planName } className={ classes }>
					<PlanFeaturesActions
						availableForPurchase={ availableForPurchase }
						forceDisplayButton={ forceDisplayButton }
						buttonText={ buttonText }
						canPurchase={ canPurchase }
						className={ getPlanClass( planName ) }
						current={ current }
						freePlan={ isFreePlan( planName ) }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
						isPlaceholder={ isPlaceholder }
						isPopular={ popular }
						manageHref={
							purchaseId
								? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
								: `/plans/my-plan/${ selectedSiteSlug }`
						}
						planName={ planConstantObj.getTitle() }
						planType={ planName }
						primaryUpgrade={ primaryUpgrade }
						onUpgradeClick={ () => this.handleUpgradeClick( properties ) }
						selectedPlan={ selectedPlan }
					/>
				</td>
			);
		} );
	}

	UNSAFE_componentWillMount() {
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
	}
}

PlanFeatures.propTypes = {
	redirectToAddDomainFlow: PropTypes.bool,
	basePlansPath: PropTypes.string,
	canPurchase: PropTypes.bool.isRequired,
	disableBloggerPlanWithNonBlogDomain: PropTypes.bool,
	displayJetpackPlans: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isJetpack: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	// either you specify the plans prop or isPlaceholder prop
	plans: PropTypes.array,
	popularPlan: PropTypes.object,
	visiblePlans: PropTypes.array,
	planProperties: PropTypes.array,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	selectedSiteSlug: PropTypes.string,
	purchaseId: PropTypes.number,
	siteId: PropTypes.number,
	sitePlan: PropTypes.object,
	kindOfPlanTypeSelector: PropTypes.oneOf( [ 'interval', 'customer' ] ),
};

PlanFeatures.defaultProps = {
	basePlansPath: null,
	displayJetpackPlans: false,
	isInSignup: false,
	isJetpack: false,
	selectedSiteSlug: '',
	siteId: null,
	onUpgradeClick: noop,
	kindOfPlanTypeSelector: 'customer',
};

export const isPrimaryUpgradeByPlanDelta = ( currentPlan, plan ) =>
	( planMatches( currentPlan, { type: TYPE_BLOGGER, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_PERSONAL, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_PERSONAL, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_PREMIUM, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_BUSINESS, group: GROUP_WPCOM } ) ) ||
	( planMatches( currentPlan, { type: TYPE_FREE, group: GROUP_WPCOM } ) &&
		planMatches( plan, { type: TYPE_P2_PLUS, group: GROUP_WPCOM } ) );

export const calculatePlanCredits = ( state, siteId, planProperties ) =>
	planProperties
		.map( ( { planName, availableForPurchase } ) => {
			if ( ! availableForPurchase ) {
				return 0;
			}
			const annualDiscountPrice = getPlanDiscountedRawPrice( state, siteId, planName );
			const annualRawPrice = getSitePlanRawPrice( state, siteId, planName );
			if ( typeof annualDiscountPrice !== 'number' || typeof annualRawPrice !== 'number' ) {
				return 0;
			}

			return annualRawPrice - annualDiscountPrice;
		} )
		.reduce( ( max, credits ) => Math.max( max, credits ), 0 );

const hasPlaceholders = ( planProperties ) =>
	planProperties.filter( ( planProps ) => planProps.isPlaceholder ).length > 0;

/* eslint-disable wpcalypso/redux-no-bound-selectors */
const ConnectedPlanFeatures = connect(
	( state, ownProps ) => {
		const {
			isInSignup,
			placeholder,
			plans,
			isLandingPage,
			siteId,
			displayJetpackPlans,
			visiblePlans,
			popularPlanSpec,
			kindOfPlanTypeSelector,
		} = ownProps;
		const selectedSiteId = siteId;
		const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
		// If no site is selected, fall back to use the `displayJetpackPlans` prop's value
		const isJetpack = selectedSiteId ? isJetpackSite( state, selectedSiteId ) : displayJetpackPlans;
		const isSiteAT = selectedSiteId ? isSiteAutomatedTransfer( state, selectedSiteId ) : false;
		const siteIsPrivate = isPrivateSite( state, selectedSiteId );
		const sitePlan = getSitePlan( state, selectedSiteId );
		const sitePlans = getPlansBySiteId( state, selectedSiteId );
		const isPaid = isCurrentPlanPaid( state, selectedSiteId );
		const signupDependencies = getSignupDependencyStore( state );
		const siteType = signupDependencies.designType;
		const canPurchase = ! isPaid || isCurrentUserCurrentPlanOwner( state, selectedSiteId );
		const isLoggedInMonthlyPricing =
			! isInSignup && ! isJetpack && kindOfPlanTypeSelector === 'interval';

		let planProperties = compact(
			map( plans, ( plan ) => {
				let isPlaceholder = false;
				const planConstantObj = applyTestFiltersToPlansList( plan, abtest, {
					isLoggedInMonthlyPricing,
				} );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isLoadingSitePlans = selectedSiteId && ! sitePlans.hasLoadedFromServer;
				const showMonthly = ! isMonthly( plan );
				const availableForPurchase = isInSignup
					? true
					: canUpgradeToPlan( state, selectedSiteId, plan ) && canPurchase;
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;
				const popular = popularPlanSpec && planMatches( plan, popularPlanSpec );
				const newPlan = isNew( plan ) && ! isPaid;
				const bestValue = isBestValue( plan ) && ! isPaid;
				const currentPlan = sitePlan && sitePlan.product_slug;
				const isMonthlyPlan = isMonthly( plan );

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = ! isJetpack || isSiteAT || ( ! relatedMonthlyPlan && showMonthly );
				let features = planConstantObj.getPlanCompareFeatures();

				// TODO: remove this once Quick Start sessions have been removed from Business Plan
				if ( isWpComBusinessPlan( plan ) ) {
					features = features.filter( ( feature ) => feature !== FEATURE_BUSINESS_ONBOARDING );
				}

				let planFeatures = getPlanFeaturesObject( features );
				if ( placeholder || ! planObject || isLoadingSitePlans ) {
					isPlaceholder = true;
				}

				if ( isInSignup ) {
					switch ( siteType ) {
						case 'blog':
							if ( planConstantObj.getBlogSignupFeatures ) {
								planFeatures = getPlanFeaturesObject(
									planConstantObj.getBlogSignupFeatures( abtest )
								);
							}

							break;
						case 'grid':
							if ( planConstantObj.getPortfolioSignupFeatures ) {
								planFeatures = getPlanFeaturesObject(
									planConstantObj.getPortfolioSignupFeatures( abtest )
								);
							}

							break;
						default:
							if ( planConstantObj.getSignupFeatures ) {
								planFeatures = getPlanFeaturesObject(
									planConstantObj.getSignupFeatures( currentPlan )
								);
							}
					}
				}

				if ( displayJetpackPlans ) {
					planFeatures = getPlanFeaturesObject( planConstantObj.getSignupFeatures( currentPlan ) );
				}
				const siteIsPrivateAndGoingAtomic = siteIsPrivate && isWpComEcommercePlan( plan );
				const isMonthlyObj = { isMonthly: showMonthlyPrice };
				const rawPrice = siteId
					? getSitePlanRawPrice( state, selectedSiteId, plan, isMonthlyObj )
					: getPlanRawPrice( state, planProductId, showMonthlyPrice );
				const discountPrice = siteId
					? getPlanDiscountedRawPrice( state, selectedSiteId, plan, isMonthlyObj )
					: getDiscountedRawPrice( state, planProductId, showMonthlyPrice );

				const annualPlansOnlyFeatures = planConstantObj.getAnnualPlansOnlyFeatures?.() || [];
				if ( annualPlansOnlyFeatures.length > 0 ) {
					planFeatures = planFeatures.map( ( feature ) => {
						const availableOnlyForAnnualPlans = annualPlansOnlyFeatures.includes(
							feature.getSlug()
						);

						return {
							...feature,
							availableOnlyForAnnualPlans,
							availableForCurrentPlan: ! isMonthlyPlan || ! availableOnlyForAnnualPlans,
						};
					} );
				}

				// Strip annual-only features out for the site's /plans page
				if ( ! isLoggedInMonthlyPricing && ( ! isInSignup || isPlaceholder ) ) {
					planFeatures = planFeatures.filter(
						( { availableForCurrentPlan = true } ) => availableForCurrentPlan
					);
				}

				return {
					availableForPurchase,
					cartItemForPlan: getCartItemForPlan( getPlanSlug( state, planProductId ) ),
					currencyCode: getCurrentUserCurrencyCode( state ),
					current: isCurrentSitePlan( state, selectedSiteId, planProductId ),
					discountPrice,
					features: planFeatures,
					isLandingPage,
					isPlaceholder,
					planConstantObj,
					planName: plan,
					planObject: planObject,
					popular: popular,
					productSlug: get( planObject, 'product_slug' ),
					newPlan: newPlan,
					bestValue: bestValue,
					hideMonthly: false,
					primaryUpgrade:
						isPrimaryUpgradeByPlanDelta( currentPlan, plan ) ||
						popular ||
						newPlan ||
						bestValue ||
						plans.length === 1,
					rawPrice,
					relatedMonthlyPlan,
					siteIsPrivateAndGoingAtomic,
					isMonthlyPlan,
				};
			} )
		);

		const planCredits = calculatePlanCredits( state, siteId, planProperties );

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( ( p ) => visiblePlans.indexOf( p.planName ) !== -1 );
		}

		const isJetpackNotAtomic = isJetpack && ! isSiteAT;

		const purchaseId = getCurrentPlanPurchaseId( state, siteId );

		const hideCustomDomainFeature = isPaid && ! isMonthly( sitePlan?.product_slug );

		return {
			productsList: getProductsList( state ),
			canPurchase,
			isJetpack,
			planProperties,
			selectedSiteSlug,
			purchaseId,
			siteIsPrivate,
			sitePlan,
			siteType,
			planCredits,
			hasPlaceholders: hasPlaceholders( planProperties ),
			isLoggedInMonthlyPricing,
			showPlanCreditsApplied:
				sitePlan &&
				sitePlan.product_slug !== PLAN_FREE &&
				planCredits &&
				! isJetpackNotAtomic &&
				! isInSignup,
			hideCustomDomainFeature,
		};
	},
	{
		recordTracksEvent,
	}
)( withShoppingCart( localize( PlanFeatures ) ) );

/* eslint-enable */

export default function PlanFeaturesWrapper( props ) {
	return (
		<CalypsoShoppingCartProvider>
			<ConnectedPlanFeatures { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
