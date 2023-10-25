/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	isBestValue,
	isMonthly,
	PLAN_FREE,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	GROUP_WPCOM,
	TYPE_P2_PLUS,
	TYPE_FREE,
	planMatches,
	applyTestFiltersToPlansList,
	getMonthlyPlanByYearly,
	getPlanPath,
	isFreePlan,
	isWpComEcommercePlan,
	getPlanClass,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { isNewsletterOrLinkInBioFlow } from '@automattic/onboarding';
import { withShoppingCart } from '@automattic/shopping-cart';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { compact, get, findIndex, last, map, reduce } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import QueryActivePromotions from 'calypso/components/data/query-active-promotions';
import FoldableCard from 'calypso/components/foldable-card';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import SpinnerLine from 'calypso/components/spinner-line';
import { retargetViewPlans } from 'calypso/lib/analytics/ad-tracking';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { getDiscountByName } from 'calypso/lib/discounts';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import {
	getHighlightedFeatures,
	getPlanDescriptionForMobile,
	getPlanFeatureAccessor,
} from 'calypso/my-sites/plan-features/util';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	getPlan,
	getPlanBySlug,
	getPlanRawPrice,
	getPlanSlug,
	getDiscountedRawPrice,
} from 'calypso/state/plans/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import {
	getPlanDiscountedRawPrice,
	getSitePlanRawPrice,
	getPlansBySiteId,
	isCurrentUserCurrentPlanOwner,
} from 'calypso/state/sites/plans/selectors';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import {
	getSitePlan,
	getSiteSlug,
	isCurrentPlanPaid,
	isCurrentSitePlan,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import PlanFeaturesActions from './actions';
import PlanFeaturesHeader from './header';
import PlanFeaturesItem from './item';
import PlanFeaturesActionsWrapper from './plan-features-action-wrapper';
import PlanFeaturesScroller from './scroller';

import './style.scss';

const noop = () => {};

/**
 * @deprecated This component is to be removed / cleaned up as part of PlanFeatures2023Grid p2-pdgrnI-24E
 */
export class PlanFeatures extends Component {
	isMounted = false;

	componentWillUnmount() {
		this.isMounted = false;
	}

	componentDidMount() {
		this.isMounted = true;
		this.props.recordTracksEvent( 'calypso_wp_plans_test_view' );
		retargetViewPlans();
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
			this.renderUpgradeDisabledNotice() ||
			this.renderDiscountNotice() ||
			this.renderCreditNotice() ||
			this.renderMarketingMessage()
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
						<br />
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
		return currentPlan !== highestPlan?.planName && highestPlan?.availableForPurchase;
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

	renderMarketingMessage() {
		const { siteId, hasPlaceholders, isInSignup } = this.props;

		if ( hasPlaceholders || isInSignup ) {
			return null;
		}

		const bannerContainer = this.getBannerContainer();
		if ( ! bannerContainer ) {
			return null;
		}

		return ReactDOM.createPortal( <MarketingMessage siteId={ siteId } />, bannerContainer );
	}

	renderMobileView() {
		const {
			redirectToAddDomainFlow,
			hidePlanTypeSelector,
			basePlansPath,
			canPurchase,
			isInSignup,
			isLandingPage,
			isJetpack,
			planProperties,
			purchaseId,
			selectedPlan,
			selectedSiteSlug,
			translate,
			showPlanCreditsApplied,
			isLaunchPage,
			isInVerticalScrollingPlansExperiment,
			flowName,
		} = this.props;

		// move any free plan to last place in mobile view
		let freePlanProperties;

		// move any popular plan to the first place in the mobile view.
		let popularPlanProperties;

		const reorderedPlans = planProperties.filter( ( properties ) => {
			if ( isFreePlan( properties.planName ) ) {
				freePlanProperties = properties;
				return false;
			}
			// remove the popular plan.
			if ( properties.popular && ! popularPlanProperties ) {
				popularPlanProperties = properties;
				return false;
			}

			return true;
		} );

		if ( popularPlanProperties ) {
			reorderedPlans.unshift( popularPlanProperties );
		}

		if ( freePlanProperties ) {
			reorderedPlans.push( freePlanProperties );
		}

		let buttonText = null;
		let forceDisplayButton = false;

		if ( redirectToAddDomainFlow === true || hidePlanTypeSelector ) {
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
			const planDescription = getPlanDescriptionForMobile( {
				flowName,
				plan: planConstantObj,
				isInVerticalScrollingPlansExperiment,
			} );
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
						audience={ planConstantObj.getAudience?.() }
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
						manageHref={
							purchaseId
								? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
								: `/plans/my-plan/${ selectedSiteSlug }`
						}
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
			const billingTimeFrame = planConstantObj.getBillingTimeFrame();
			let audience = planConstantObj.getAudience?.();

			if ( disableBloggerPlanWithNonBlogDomain || this.props.nonDotBlogDomains.length > 0 ) {
				if ( planMatches( planName, { type: TYPE_BLOGGER } ) ) {
					discountPrice = 0;
				}
			}

			if ( isInSignup ) {
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
						audience = planConstantObj.getAudience?.();
				}
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
				description = planConstantObj.getShortDescription();
			} else {
				description = planConstantObj.getDescription();
			}

			return (
				<td key={ planName } className={ classes }>
					{ isPlaceholder ? <SpinnerLine /> : null }

					<p className="plan-features__description">{ description }</p>
				</td>
			);
		} );
	}

	handleUpgradeClick = async ( singlePlanProperties ) => {
		const {
			isInSignup,
			onUpgradeClick: ownPropsOnUpgradeClick,
			redirectTo,
			withDiscount,
			selectedSiteSlug,
			shoppingCartManager,
			redirectToAddDomainFlow,
			hidePlanTypeSelector,
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

		if ( hidePlanTypeSelector ) {
			try {
				// In this flow we redirect to checkout with both the plan and domain
				// product in the cart.
				await shoppingCartManager.addProductsToCart( [
					{
						product_slug: productSlug,
						extra: {
							afterPurchaseUrl: redirectTo ?? undefined,
						},
					},
				] );
			} catch {
				// Nothing needs to be done here. CartMessages will display the error to the user.
				return;
			}

			if ( withDiscount && this.isMounted ) {
				try {
					await shoppingCartManager.applyCoupon( withDiscount );
				} catch {
					// If the coupon does not apply, let's continue to checkout anyway.
				}
			}

			this.isMounted && page( `/checkout/${ selectedSiteSlug }` );
			return;
		}

		if ( redirectToAddDomainFlow === true ) {
			try {
				// In this flow, we add the product to the cart directly and then
				// redirect to the "add a domain" page.
				await shoppingCartManager.addProductsToCart( [
					{
						product_slug: productSlug,
						extra: {
							afterPurchaseUrl: redirectTo ?? undefined,
						},
					},
				] );
			} catch {
				// Nothing needs to be done here. CartMessages will display the error to the user.
				return;
			}

			if ( withDiscount && this.isMounted ) {
				try {
					await shoppingCartManager.applyCoupon( withDiscount );
				} catch {
					// If the coupon does not apply, let's continue to the next page anyway.
				}
			}

			this.isMounted && page( `/domains/add/${ selectedSiteSlug }` );
			return;
		}

		const planPath = getPlanPath( planName ) || '';
		const checkoutUrlArgs = {};
		// Auto-apply the coupon code to the cart for WPCOM sites
		if ( withDiscount ) {
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
	};

	renderTopButtons() {
		const {
			canPurchase,
			disableBloggerPlanWithNonBlogDomain,
			isInSignup,
			isLandingPage,
			isLaunchPage,
			nonDotBlogDomains,
			planProperties,
			redirectToAddDomainFlow,
			selectedPlan,
			selectedSiteSlug,
			purchaseId,
		} = this.props;

		return planProperties.map( ( planPropertiesPlan ) => {
			return (
				<PlanFeaturesActionsWrapper
					canPurchase={ canPurchase }
					className="is-top-buttons"
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					handleUpgradeClick={ this.handleUpgradeClick }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					nonDotBlogDomains={ nonDotBlogDomains }
					planPropertiesPlan={ planPropertiesPlan }
					key={ planPropertiesPlan.planName }
					redirectToAddDomainFlow={ redirectToAddDomainFlow }
					selectedPlan={ selectedPlan }
					selectedSiteSlug={ selectedSiteSlug }
					purchaseId={ purchaseId }
				/>
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
		const { flowName, isInVerticalScrollingPlansExperiment } = this.props;
		const description = feature.getDescription
			? feature.getDescription( undefined, this.props.domainName )
			: null;
		const classes = classNames( 'plan-features__item-info', {
			'is-annual-plan-feature': feature.availableOnlyForAnnualPlans,
			'is-available': feature.availableForCurrentPlan,
			'is-bold': feature.isHighlightedFeature,
		} );
		const isMobileNewsletterLinkinBio =
			isInVerticalScrollingPlansExperiment && isNewsletterOrLinkInBioFlow( flowName );
		const hideInfoPopover = isMobileNewsletterLinkinBio || feature.hideInfoPopover || ! description;
		return (
			<PlanFeaturesItem
				key={ index }
				description={ description }
				hideInfoPopover={ hideInfoPopover }
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
		const { planProperties, selectedFeature, withScroll } = this.props;

		return map( planProperties, ( properties ) => {
			const { availableForPurchase, features, planName } = properties;
			const featureKeys = Object.keys( features );
			const key = featureKeys[ rowIndex ];
			const currentFeature = features[ key ];

			const classes = classNames( 'plan-features__table-item', getPlanClass( planName ), {
				'has-partial-border': ! withScroll && rowIndex + 1 < featureKeys.length,
				'is-last-feature': rowIndex + 1 === featureKeys.length,
				'is-highlighted':
					selectedFeature &&
					currentFeature &&
					selectedFeature === currentFeature.getSlug() &&
					availableForPurchase,
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
			nonDotBlogDomains,
			planProperties,
			redirectToAddDomainFlow,
			selectedPlan,
			selectedSiteSlug,
			purchaseId,
		} = this.props;
		return planProperties.map( ( planPropertiesPlan ) => {
			return (
				<PlanFeaturesActionsWrapper
					canPurchase={ canPurchase }
					className="is-bottom-buttons"
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					handleUpgradeClick={ this.handleUpgradeClick }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					nonDotBlogDomains={ nonDotBlogDomains }
					planPropertiesPlan={ planPropertiesPlan }
					key={ planPropertiesPlan.planName }
					redirectToAddDomainFlow={ redirectToAddDomainFlow }
					selectedPlan={ selectedPlan }
					selectedSiteSlug={ selectedSiteSlug }
					purchaseId={ purchaseId }
				/>
			);
		} );
	}
}

PlanFeatures.propTypes = {
	redirectToAddDomainFlow: PropTypes.bool,
	basePlansPath: PropTypes.string,
	canPurchase: PropTypes.bool.isRequired,
	disableBloggerPlanWithNonBlogDomain: PropTypes.bool,
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
	flowName: PropTypes.string,
};

PlanFeatures.defaultProps = {
	basePlansPath: null,
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

/**
 * @deprecated Use the useCalculateMaxPlanUpgradeCredit hook instead, to be cleaned up with Plan
 * @module calypso/my-sites/plans-grid/hooks/use-calculate-max-plan-upgrade-credit
 */
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
			visiblePlans,
			popularPlanSpec,
			kindOfPlanTypeSelector,
			isInVerticalScrollingPlansExperiment,
			flowName = getCurrentFlowName( state ),
		} = ownProps;
		const selectedSiteId = siteId;
		const selectedSiteSlug = getSiteSlug( state, selectedSiteId );
		const isJetpack = selectedSiteId ? isJetpackSite( state, selectedSiteId ) : false;
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
				const planConstantObj = applyTestFiltersToPlansList( plan, undefined, {
					isLoggedInMonthlyPricing,
				} );
				const planProductId = planConstantObj.getProductId();
				const planObject = getPlan( state, planProductId );
				const isLoadingSitePlans = selectedSiteId && ! sitePlans.hasLoadedFromServer;
				const isMonthlyPlan = isMonthly( plan );
				const showMonthly = ! isMonthlyPlan;
				const availableForPurchase =
					isInSignup || isPlanAvailableForPurchase( state, selectedSiteId, plan );
				const relatedMonthlyPlan = showMonthly
					? getPlanBySlug( state, getMonthlyPlanByYearly( plan ) )
					: null;
				const popular = popularPlanSpec && planMatches( plan, popularPlanSpec );

				const newPlan = false;
				const bestValue = isBestValue( plan ) && ! isPaid;
				const currentPlan = sitePlan && sitePlan.product_slug;

				// Show price divided by 12? Only for non JP plans, or if plan is only available yearly.
				const showMonthlyPrice = ! isJetpack || isSiteAT || ( ! relatedMonthlyPlan && showMonthly );

				const features = planConstantObj.getPlanCompareFeatures();

				let planFeatures = getPlanFeaturesObject( features );
				if ( placeholder || ! planObject || isLoadingSitePlans ) {
					isPlaceholder = true;
				}

				// Mobile view
				if ( isInSignup ) {
					const featureAccessor = getPlanFeatureAccessor( {
						flowName,
						plan: planConstantObj,
						isInVerticalScrollingPlansExperiment,
					} );
					if ( featureAccessor ) {
						planFeatures = getPlanFeaturesObject( featureAccessor() );
					}

					const highlightedFeatures = getHighlightedFeatures( flowName, planConstantObj );
					if ( highlightedFeatures.length ) {
						planFeatures = planFeatures.map( ( feature ) => {
							return {
								...feature,
								isHighlightedFeature: highlightedFeatures.includes( feature.getSlug() ),
							};
						} );
					}
				}

				const siteIsPrivateAndGoingAtomic = siteIsPrivate && isWpComEcommercePlan( plan );
				const isMonthlyObj = { returnMonthly: showMonthlyPrice };
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
					isMonthlyPlan,
					isPlaceholder,
					planConstantObj,
					planName: plan,
					planObject: planObject,
					popular,
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
				};
			} )
		);

		const planCredits = calculatePlanCredits( state, siteId, planProperties );

		if ( Array.isArray( visiblePlans ) ) {
			planProperties = planProperties.filter( ( p ) => visiblePlans.indexOf( p.planName ) !== -1 );
		}

		const isJetpackNotAtomic = isJetpack && ! isSiteAT;

		const purchaseId = getCurrentPlanPurchaseId( state, siteId );

		return {
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
			flowName,
		};
	},
	{
		recordTracksEvent,
	}
)( withCartKey( withShoppingCart( localize( PlanFeatures ) ) ) );

/* eslint-enable */

export default function PlanFeaturesWrapper( props ) {
	return (
		<CalypsoShoppingCartProvider>
			<ConnectedPlanFeatures { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
