import {
	chooseDefaultCustomerType,
	findPlansKeys,
	getPlan,
	getPopularPlanSpec,
	isFreePlan,
	isBloggerPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	isProPlan,
	isStarterPlan,
	planMatches,
	TYPE_FREE,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TERM_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	getPlanPath,
	GROUP_WPCOM,
	PLAN_PERSONAL,
	TITAN_MAIL_MONTHLY_SLUG,
	PLAN_FREE,
	is2023PricingGridActivePage,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { hasTranslation } from '@wordpress/i18n';
import warn from '@wordpress/warning';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import Notice from 'calypso/components/notice';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { getTld } from 'calypso/lib/domains';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import PlanFeatures from 'calypso/my-sites/plan-features';
import PlanFeaturesComparison from 'calypso/my-sites/plan-features-comparison';
import PlanFAQ from 'calypso/my-sites/plans-features-main/components/plan-faq';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import TermExperimentPlanTypeSelector from 'calypso/my-sites/plans-features-main/components/term-experiment-plan-type-selector';
import WpcomFAQ from 'calypso/my-sites/plans-features-main/components/wpcom-faq';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import { selectSiteId as selectHappychatSiteId } from 'calypso/state/help/actions';
import { getProductDisplayCost } from 'calypso/state/products-list/selectors';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import isEligibleForWpComMonthlyPlan from 'calypso/state/selectors/is-eligible-for-wpcom-monthly-plan';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import {
	getSitePlan,
	getSiteSlug,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import { FreePlanPaidDomainDialog } from './components/free-plan-paid-domain-dialog';
import './style.scss';

export class PlansFeaturesMain extends Component {
	state = {
		isFreePlanPaidDomainDialogOpen: false,
	};

	componentDidUpdate( prevProps ) {
		/**
		 * Happychat does not update with the selected site right now :(
		 * This ensures that Happychat groups are correct in case we switch sites while on the plans
		 * page, for example between a Jetpack and Simple site.
		 *
		 * TODO: When happychat correctly handles site switching, remove selectHappychatSiteId action.
		 */
		const { siteId } = this.props;
		const { siteId: prevSiteId } = prevProps;
		if ( siteId && siteId !== prevSiteId ) {
			this.props.selectHappychatSiteId( siteId );
		}
	}

	isDisplayingPlansNeededForFeature() {
		const { selectedFeature, selectedPlan, previousRoute } = this.props;

		if (
			isValidFeatureKey( selectedFeature ) &&
			getPlan( selectedPlan ) &&
			! isPersonalPlan( selectedPlan ) &&
			( this.getKindOfPlanTypeSelector( this.props ) === 'interval' ||
				! previousRoute.startsWith( '/plans/' ) )
		) {
			return true;
		}
	}

	toggleIsFreePlanPaidDomainDialogOpen = () => {
		this.setState( ( { isFreePlanPaidDomainDialogOpen } ) => ( {
			isFreePlanPaidDomainDialogOpen: ! isFreePlanPaidDomainDialogOpen,
		} ) );
	};

	onUpgradeClick = ( cartItemForPlan ) => {
		const { domainName, onUpgradeClick, siteSlug, flowName } = this.props;
		// The `cartItemForPlan` var is null if the free plan is selected
		if ( cartItemForPlan == null && 'onboarding' === flowName && domainName ) {
			this.toggleIsFreePlanPaidDomainDialogOpen();
			return;
		}
		if ( onUpgradeClick ) {
			onUpgradeClick( cartItemForPlan );
			return;
		}
		const planPath = getPlanPath( cartItemForPlan?.product_slug ) || '';
		const checkoutUrlWithArgs = `/checkout/${ siteSlug }/${ planPath }`;
		page( checkoutUrlWithArgs );
	};

	renderFreePlanPaidDomainModal = () => {
		const { domainName, replacePaidDomainWithFreeDomain, onUpgradeClick } = this.props;
		return (
			<FreePlanPaidDomainDialog
				domainName={ domainName }
				suggestedPlanSlug={ PLAN_PERSONAL }
				onClose={ this.toggleIsFreePlanPaidDomainDialogOpen }
				onFreePlanSelected={ ( freeDomainSuggestion ) => {
					replacePaidDomainWithFreeDomain( freeDomainSuggestion );
					onUpgradeClick( null );
				} }
				onPlanSelected={ () => {
					const cartItemForPlan = getCartItemForPlan( PLAN_PERSONAL );
					onUpgradeClick( cartItemForPlan );
				} }
			/>
		);
	};

	render2023OnboardingPricingGrid( plans, visiblePlans ) {
		const {
			basePlansPath,
			customerType,
			domainName,
			isInSignup,
			isJetpack,
			isLandingPage,
			isLaunchPage,
			flowName,
			selectedFeature,
			selectedPlan,
			withDiscount,
			discountEndDate,
			redirectTo,
			siteId,
			plansWithScroll,
			isReskinned,
			isPlansInsideStepper,
			intervalType,
			planTypeSelectorProps,
			hidePlansFeatureComparison,
			replacePaidDomainWithFreeDomain,
			sitePlanSlug,
		} = this.props;

		const asyncProps = {
			basePlansPath,
			domainName,
			isInSignup,
			isLandingPage,
			isLaunchPage,
			onUpgradeClick: this.onUpgradeClick,
			plans,
			flowName,
			redirectTo,
			visiblePlans,
			selectedFeature,
			selectedPlan,
			withDiscount,
			discountEndDate,
			withScroll: plansWithScroll,
			popularPlanSpec: getPopularPlanSpec( {
				flowName,
				customerType,
				isJetpack,
				availablePlans: visiblePlans,
			} ),
			siteId,
			isReskinned,
			isPlansInsideStepper,
			intervalType,
			hidePlansFeatureComparison,
			replacePaidDomainWithFreeDomain,
			currentSitePlanSlug: sitePlanSlug,
		};
		const asyncPlanFeatures2023Grid = (
			<AsyncLoad
				require="calypso/my-sites/plan-features-2023-grid"
				{ ...asyncProps }
				planTypeSelectorProps={ planTypeSelectorProps }
			/>
		);

		return (
			<div
				className={ classNames(
					'plans-features-main__group',
					'is-wpcom',
					`is-customer-${ customerType }`,
					'is-2023-pricing-grid',
					{
						'is-scrollable': plansWithScroll,
					}
				) }
				data-e2e-plans="wpcom"
			>
				{ asyncPlanFeatures2023Grid }
			</div>
		);
	}

	// TODO:
	// These legacy components should also be loaded in async.
	renderLegacyPricingGrid( plans, visiblePlans ) {
		const {
			basePlansPath,
			busyOnUpgradeClick,
			currentPurchaseIsInAppPurchase,
			customerType,
			disableBloggerPlanWithNonBlogDomain,
			domainName,
			isInSignup,
			isJetpack,
			isLandingPage,
			isLaunchPage,
			isCurrentPlanRetired,
			isFAQCondensedExperiment,
			isReskinned,
			onUpgradeClick,
			selectedFeature,
			selectedPlan,
			shouldShowPlansFeatureComparison,
			withDiscount,
			discountEndDate,
			redirectTo,
			siteId,
			plansWithScroll,
			isInVerticalScrollingPlansExperiment,
			redirectToAddDomainFlow,
			hidePlanTypeSelector,
			translate,
			locale,
			flowName,
			isPlansInsideStepper,
		} = this.props;

		const legacyText =
			locale === 'en' ||
			hasTranslation(
				'Your current plan is no longer available for new subscriptions. ' +
					'You’re all set to continue with the plan for as long as you like. ' +
					'Alternatively, you can switch to any of our current plans by selecting it below. ' +
					'Please keep in mind that switching plans will be irreversible.'
			)
				? translate(
						'Your current plan is no longer available for new subscriptions. ' +
							'You’re all set to continue with the plan for as long as you like. ' +
							'Alternatively, you can switch to any of our current plans by selecting it below. ' +
							'Please keep in mind that switching plans will be irreversible.'
				  )
				: null;

		if ( shouldShowPlansFeatureComparison ) {
			return (
				<div
					className={ classNames(
						'plans-features-main__group',
						'is-wpcom',
						`is-customer-${ customerType }`,
						{
							'is-scrollable': plansWithScroll,
						}
					) }
					data-e2e-plans="wpcom"
				>
					<PlanFeaturesComparison
						basePlansPath={ basePlansPath }
						domainName={ domainName }
						isInSignup={ isInSignup }
						isLandingPage={ isLandingPage }
						isLaunchPage={ isLaunchPage }
						onUpgradeClick={ onUpgradeClick }
						plans={ plans }
						flowName={ flowName }
						redirectTo={ redirectTo }
						visiblePlans={ visiblePlans }
						selectedFeature={ selectedFeature }
						selectedPlan={ selectedPlan }
						withDiscount={ withDiscount }
						discountEndDate={ discountEndDate }
						withScroll={ plansWithScroll }
						popularPlanSpec={ getPopularPlanSpec( {
							flowName,
							customerType,
							isJetpack,
							availablePlans: visiblePlans,
						} ) }
						siteId={ siteId }
						isReskinned={ isReskinned }
						isFAQCondensedExperiment={ isFAQCondensedExperiment }
						isPlansInsideStepper={ isPlansInsideStepper }
						busyOnUpgradeClick={ busyOnUpgradeClick }
					/>
				</div>
			);
		}

		return (
			<div
				className={ classNames(
					'plans-features-main__group',
					'is-wpcom',
					`is-customer-${ customerType }`,
					{
						'is-scrollable': plansWithScroll,
					}
				) }
				data-e2e-plans="wpcom"
			>
				{ isCurrentPlanRetired && legacyText && (
					<Notice showDismiss={ false } status="is-info" text={ legacyText } />
				) }
				{ ! isCurrentPlanRetired && currentPurchaseIsInAppPurchase && (
					<Notice
						showDismiss={ false }
						status="is-info"
						text={ translate(
							'Your current plan is an in-app purchase. You can upgrade to a different plan from within the WordPress app.'
						) }
					></Notice>
				) }
				{ this.renderSecondaryFormattedHeader() }
				<PlanFeatures
					redirectToAddDomainFlow={ redirectToAddDomainFlow }
					hidePlanTypeSelector={ hidePlanTypeSelector }
					basePlansPath={ basePlansPath }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					domainName={ domainName }
					nonDotBlogDomains={ this.filterDotBlogDomains() }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					onUpgradeClick={ onUpgradeClick }
					plans={ plans }
					redirectTo={ redirectTo }
					visiblePlans={ visiblePlans }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					discountEndDate={ discountEndDate }
					withScroll={ plansWithScroll }
					popularPlanSpec={ getPopularPlanSpec( {
						flowName,
						customerType,
						isJetpack,
						availablePlans: visiblePlans,
					} ) }
					flowName={ flowName }
					siteId={ siteId }
					isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
					kindOfPlanTypeSelector={ this.getKindOfPlanTypeSelector( this.props ) }
					isPlansInsideStepper={ isPlansInsideStepper }
				/>
			</div>
		);
	}

	getPlanBillingPeriod( intervalType, defaultValue = null ) {
		const plans = {
			monthly: TERM_MONTHLY,
			yearly: TERM_ANNUALLY,
			'2yearly': TERM_BIENNIALLY,
			'3yearly': TERM_TRIENNIALLY,
		};

		return plans[ intervalType ] || defaultValue || TERM_ANNUALLY;
	}

	getDefaultPlanTypes() {
		const { selectedPlan, sitePlanSlug, hideEnterprisePlan, is2023PricingGridVisible } = this.props;

		const isBloggerAvailable = isBloggerPlan( selectedPlan ) || isBloggerPlan( sitePlanSlug );

		// TODO:
		// this should fall into the processing function for the visible plans
		// however, the Enterprise plan isn't a real plan and lack of some required support
		// from the utility functions right now.
		const isEnterpriseAvailable = is2023PricingGridVisible && ! hideEnterprisePlan;

		return [
			TYPE_FREE,
			isBloggerAvailable && TYPE_BLOGGER,
			TYPE_PERSONAL,
			TYPE_PREMIUM,
			TYPE_BUSINESS,
			TYPE_ECOMMERCE,
			isEnterpriseAvailable && TYPE_ENTERPRISE_GRID_WPCOM,
		].filter( ( el ) => el );
	}

	getPlansFromTypes( planTypes, group, term ) {
		const plans = planTypes.reduce( ( accum, type ) => {
			// the Free plan and the Enterprise plan don't have a term.
			// We may consider to move this logic into the underlying `planMatches` function, but that would have wider implication so it's TBD
			const planQuery =
				type === TYPE_FREE || type === TYPE_ENTERPRISE_GRID_WPCOM
					? { group, type }
					: { group, type, term };
			const plan = findPlansKeys( planQuery )[ 0 ];

			if ( ! plan ) {
				warn(
					`Invalid plan type, \`${ type }\`, provided to \`PlansFeaturesMain\` component. See plans constants for valid plan types.`
				);
			}

			return plan ? [ ...accum, plan ] : accum;
		}, [] );

		return plans;
	}

	isPersonalCustomerTypePlanVisible() {
		const { hidePersonalPlan } = this.props;
		return ! hidePersonalPlan;
	}

	getVisiblePlansForPlanFeatures( availablePlans ) {
		const {
			customerType,
			selectedPlan,
			plansWithScroll,
			isAllPaidPlansShown,
			isInMarketplace,
			sitePlanSlug,
			is2023PricingGridVisible,
			hideFreePlan,
			hidePersonalPlan,
			hidePremiumPlan,
			hideEcommercePlan,
		} = this.props;

		const isPlanOneOfType = ( plan, types ) =>
			types.filter( ( type ) => planMatches( plan, { type } ) ).length > 0;

		let plans = this.isDisplayingPlansNeededForFeature()
			? availablePlans.filter( ( plan ) => {
					if ( isEcommercePlan( selectedPlan ) ) {
						return isEcommercePlan( plan );
					}
					if ( isBusinessPlan( selectedPlan ) ) {
						return isBusinessPlan( plan ) || isEcommercePlan( plan );
					}
					if ( isPremiumPlan( selectedPlan ) ) {
						return isPremiumPlan( plan ) || isBusinessPlan( plan ) || isEcommercePlan( plan );
					}
			  } )
			: availablePlans;

		if ( hideFreePlan ) {
			plans = plans.filter( ( planSlug ) => ! isFreePlan( planSlug ) );
		}

		if ( hidePersonalPlan ) {
			plans = plans.filter( ( planSlug ) => ! isPersonalPlan( planSlug ) );
		}

		if ( hidePremiumPlan ) {
			plans = plans.filter( ( planSlug ) => ! isPremiumPlan( planSlug ) );
		}

		if ( hideEcommercePlan ) {
			plans = plans.filter( ( planSlug ) => ! isEcommercePlan( planSlug ) );
		}

		if ( is2023PricingGridVisible ) {
			plans = plans.filter( ( plan ) =>
				isPlanOneOfType( plan, [
					TYPE_FREE,
					TYPE_PERSONAL,
					TYPE_PREMIUM,
					TYPE_BUSINESS,
					TYPE_ECOMMERCE,
					TYPE_ENTERPRISE_GRID_WPCOM,
				] )
			);

			return plans;
		}

		if ( plansWithScroll ) {
			return plans.filter( ( plan ) =>
				isPlanOneOfType( plan, [
					TYPE_BLOGGER,
					TYPE_PERSONAL,
					TYPE_PREMIUM,
					TYPE_BUSINESS,
					TYPE_ECOMMERCE,
				] )
			);
		}

		const withIntervalSelector = this.getKindOfPlanTypeSelector( this.props ) === 'interval';

		if ( isInMarketplace ) {
			// workaround to show free plan on both monthly/yearly toggle
			if ( sitePlanSlug === PLAN_FREE && ! plans.includes( PLAN_FREE ) ) {
				// elements are rendered in order, needs to be the first one
				plans.unshift( PLAN_FREE );
			}
			return plans.filter(
				( plan ) =>
					plan === sitePlanSlug || isPlanOneOfType( plan, [ TYPE_BUSINESS, TYPE_ECOMMERCE ] )
			);
		}

		if ( isAllPaidPlansShown || withIntervalSelector ) {
			return plans.filter( ( plan ) =>
				isPlanOneOfType( plan, [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ] )
			);
		}

		if ( customerType === 'personal' && this.isPersonalCustomerTypePlanVisible() ) {
			return plans.filter( ( plan ) =>
				isPlanOneOfType( plan, [ TYPE_FREE, TYPE_BLOGGER, TYPE_PERSONAL, TYPE_PREMIUM ] )
			);
		}

		return plans.filter( ( plan ) =>
			isPlanOneOfType( plan, [ TYPE_FREE, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ] )
		);
	}

	renderSecondaryFormattedHeader() {
		const { siteSlug, translate } = this.props;
		let headerText;
		let subHeaderText;

		if ( this.isDisplayingPlansNeededForFeature() ) {
			headerText = translate( 'Upgrade your plan to access this feature and more' );
			subHeaderText = (
				<Button
					className="plans-features-main__view-all-plans is-link"
					href={ `/plans/${ siteSlug }` }
				>
					{ translate( 'View all plans' ) }
				</Button>
			);
		}
		if ( ! headerText ) {
			return null;
		}

		return (
			<FormattedHeader
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				compactOnMobile
				isSecondary
			/>
		);
	}

	mayRenderFAQ() {
		const { isInSignup, titanMonthlyRenewalCost, showFAQ } = this.props;

		if ( ! showFAQ ) {
			return;
		}

		if ( isInSignup ) {
			return <PlanFAQ titanMonthlyRenewalCost={ titanMonthlyRenewalCost } />;
		}

		return <WpcomFAQ />;
	}

	getKindOfPlanTypeSelector( props ) {
		return props.planTypeSelector;
	}

	renderPlansGrid( plans, visiblePlans ) {
		return this.props.is2023PricingGridVisible
			? this.render2023OnboardingPricingGrid( plans, visiblePlans )
			: this.renderLegacyPricingGrid( plans, visiblePlans );
	}

	render() {
		const {
			siteId,
			redirectToAddDomainFlow,
			hidePlanTypeSelector,
			is2023PricingGridVisible,
			planTypeSelectorProps,
			intervalType,
			selectedPlan,
		} = this.props;

		/*
		 * We need to pass all the plans in order to show the correct features in the plan comparison table.
		 * Pleas use the getVisiblePlansForPlanFeatures selector to filter out the plans that should not be visible.
		 * we pass `visiblePlans` to its `plans` prop.
		 */
		const term = this.getPlanBillingPeriod( intervalType, getPlan( selectedPlan )?.term );
		const planTypes = this.props.planTypes || this.getDefaultPlanTypes();
		const plans = this.getPlansFromTypes( planTypes, GROUP_WPCOM, term );
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
		const kindOfPlanTypeSelector = this.getKindOfPlanTypeSelector( this.props );

		// If advertising plans for a certain feature, ensure user has pressed "View all plans" before they can see others
		let hidePlanSelector =
			kindOfPlanTypeSelector === 'customer' && this.isDisplayingPlansNeededForFeature();

		// In the "purchase a plan and free domain" flow we do not want to show
		// monthly plans because monthly plans do not come with a free domain.
		if ( redirectToAddDomainFlow !== undefined || hidePlanTypeSelector ) {
			hidePlanSelector = true;
		}

		return (
			<div
				className={ classNames( 'plans-features-main', {
					'is-pricing-grid-2023-plans-features-main ': is2023PricingGridVisible,
				} ) }
			>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<HappychatConnection />
				<PlanNotice
					visiblePlans={ visiblePlans }
					siteId={ siteId }
					isInSignup={ this.props.isInSignup }
					discountInformation={ {
						withDiscount: this.props.withDiscount,
						discountEndDate: this.props.discountEndDate,
					} }
				/>
				{ ! hidePlanSelector && (
					<TermExperimentPlanTypeSelector
						isEligible={ is2023PricingGridVisible }
						kind={ kindOfPlanTypeSelector }
						plans={ visiblePlans }
						planTypeSelectorProps={ planTypeSelectorProps }
					/>
				) }
				{ this.state.isFreePlanPaidDomainDialogOpen && this.renderFreePlanPaidDomainModal() }
				{ this.renderPlansGrid( plans, visiblePlans ) }
				{ this.mayRenderFAQ() }
			</div>
		);
	}

	filterDotBlogDomains() {
		const domains = get( this.props, 'domains', [] );
		return domains.filter( function ( domainInfo ) {
			if ( domainInfo.type === 'WPCOM' ) {
				return false;
			}

			const domainName = get( domainInfo, [ 'domain' ], '' );
			return ! 'blog'.startsWith( getTld( domainName ) );
		} );
	}
}

PlansFeaturesMain.propTypes = {
	redirectToAddDomainFlow: PropTypes.bool,
	hidePlanTypeSelector: PropTypes.bool,
	basePlansPath: PropTypes.string,
	hideFreePlan: PropTypes.bool,
	hidePersonalPlan: PropTypes.bool,
	hidePremiumPlan: PropTypes.bool,
	hideEcommercePlan: PropTypes.bool,
	hideEnterprisePlan: PropTypes.bool,
	customerType: PropTypes.string,
	flowName: PropTypes.string,
	intervalType: PropTypes.oneOf( [ 'monthly', 'yearly', '2yearly', '3yearly' ] ),
	isChatAvailable: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	isStepperUpgradeFlow: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	redirectTo: PropTypes.string,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	showFAQ: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	isAllPaidPlansShown: PropTypes.bool,
	plansWithScroll: PropTypes.bool,
	planTypes: PropTypes.array,
	isReskinned: PropTypes.bool,
	isPlansInsideStepper: PropTypes.bool,
	planTypeSelector: PropTypes.string,
	busyOnUpgradeClick: PropTypes.bool,
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	hidePersonalPlan: false,
	hidePremiumPlan: false,
	hideEnterprisePlan: false,
	intervalType: 'yearly',
	isChatAvailable: false,
	showFAQ: true,
	siteId: null,
	siteSlug: '',
	plansWithScroll: false,
	isReskinned: false,
	planTypeSelector: 'interval',
	isPlansInsideStepper: false,
	busyOnUpgradeClick: false,
	isStepperUpgradeFlow: false,
};

export default connect(
	( state, props ) => {
		const siteId = get( props.site, [ 'ID' ] );
		const sitePlan = getSitePlan( state, siteId );
		const currentPlan = getCurrentPlan( state, siteId );
		const currentPurchase = getByPurchaseId( state, currentPlan?.id );
		const sitePlanSlug = sitePlan?.product_slug;
		const eligibleForWpcomMonthlyPlans = isEligibleForWpComMonthlyPlan( state, siteId );
		const titanMonthlyRenewalCost = getProductDisplayCost( state, TITAN_MAIL_MONTHLY_SLUG );
		const siteSlug = getSiteSlug( state, get( props.site, [ 'ID' ] ) );

		let customerType = chooseDefaultCustomerType( {
			currentCustomerType: props.customerType,
			selectedPlan: props.selectedPlan,
			sitePlan,
		} );

		// Make sure the plans for the default customer type can be purchased.
		if (
			! props.customerType &&
			customerType === 'personal' &&
			! canUpgradeToPlan( state, siteId, PLAN_PERSONAL )
		) {
			customerType = 'business';
		}
		const is2023PricingGridVisible =
			props.is2023PricingGridVisible ?? is2023PricingGridActivePage( window );
		const planTypeSelectorProps = {
			basePlansPath: props.basePlansPath,
			isStepperUpgradeFlow: props.isStepperUpgradeFlow,
			isInSignup: props.isInSignup,
			eligibleForWpcomMonthlyPlans: eligibleForWpcomMonthlyPlans,
			isPlansInsideStepper: props.isPlansInsideStepper,
			intervalType: props.intervalType,
			customerType: customerType,
			hidePersonalPlan: props.hidePersonalPlan,
			siteSlug,
		};

		return {
			isCurrentPlanRetired: isProPlan( sitePlanSlug ) || isStarterPlan( sitePlanSlug ),
			currentPurchaseIsInAppPurchase: currentPurchase?.isInAppPurchase,
			customerType,
			domains: getDomainsBySiteId( state, siteId ),
			isChatAvailable: isHappychatAvailable( state ),
			isJetpack: isJetpackSite( state, siteId ),
			isMultisite: isJetpackSiteMultiSite( state, siteId ),
			previousRoute: getPreviousRoute( state ),
			siteId,
			siteSlug,
			sitePlanSlug,
			eligibleForWpcomMonthlyPlans,
			titanMonthlyRenewalCost,
			is2023PricingGridVisible,
			showFAQ: !! props.showFAQ && ! is2023PricingGridVisible,
			planTypeSelectorProps,
		};
	},
	{
		selectHappychatSiteId,
	}
)( localize( PlansFeaturesMain ) );
