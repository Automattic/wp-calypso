import { isEnabled } from '@automattic/calypso-config';
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
	GROUP_WPCOM,
	PLAN_PERSONAL,
	TITAN_MAIL_MONTHLY_SLUG,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { isNewsletterOrLinkInBioFlow } from '@automattic/onboarding';
import { hasTranslation } from '@wordpress/i18n';
import warn from '@wordpress/warning';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
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
import { getTld } from 'calypso/lib/domains';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import PlanFeatures from 'calypso/my-sites/plan-features';
import PlanFeaturesComparison from 'calypso/my-sites/plan-features-comparison';
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
import PlanTypeSelector from './plan-type-selector';
import PlanFAQ from './plansStepFaq';
import WpcomFAQ from './wpcom-faq';

import './style.scss';

export class PlansFeaturesMain extends Component {
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

	show2023OnboardingPricingGrid() {
		const {
			basePlansPath,
			customerType,
			domainName,
			isInSignup,
			isJetpack,
			isLandingPage,
			isLaunchPage,
			flowName,
			onUpgradeClick,
			selectedFeature,
			selectedPlan,
			withDiscount,
			discountEndDate,
			redirectTo,
			siteId,
			plansWithScroll,
			isReskinned,
			isFAQCondensedExperiment,
			isPlansInsideStepper,
			is2023OnboardingPricingGrid,
			intervalType,
		} = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );

		if ( is2023OnboardingPricingGrid ) {
			const asyncProps = {
				basePlansPath,
				domainName,
				isInSignup,
				isLandingPage,
				isLaunchPage,
				onUpgradeClick,
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
			};
			const planTypeSelectorProps = {
				isInSignup: this.props.isInSignup,
				eligibleForWpcomMonthlyPlans: this.props.eligibleForWpcomMonthlyPlans,
				isPlansInsideStepper: this.props.isPlansInsideStepper,
				intervalType: this.props.intervalType,
				customerType: this.props.customerType,
				hidePersonalPlan: this.props.hidePersonalPlan,
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
				/>
			</div>
		);
	}

	getPlanFeatures() {
		const {
			basePlansPath,
			currentPurchaseIsInAppPurchase,
			customerType,
			disableBloggerPlanWithNonBlogDomain,
			domainName,
			isInSignup,
			isJetpack,
			isLandingPage,
			isLaunchPage,
			isCurrentPlanRetired,
			onUpgradeClick,
			selectedFeature,
			selectedPlan,
			withDiscount,
			discountEndDate,
			redirectTo,
			siteId,
			plansWithScroll,
			isInVerticalScrollingPlansExperiment,
			redirectToAddDomainFlow,
			domainAndPlanPackage,
			translate,
			locale,
			flowName,
			isPlansInsideStepper,
		} = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
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
					domainAndPlanPackage={ domainAndPlanPackage }
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

	getPlansForPlanFeatures() {
		const {
			intervalType,
			selectedPlan,
			hideFreePlan,
			hidePersonalPlan,
			hidePremiumPlan,
			sitePlanSlug,
			showTreatmentPlansReorderTest,
			flowName,
			isInSignup,
			is2023OnboardingPricingGrid,
		} = this.props;

		const hideBloggerPlan = ! isBloggerPlan( selectedPlan ) && ! isBloggerPlan( sitePlanSlug );
		const term = this.getPlanBillingPeriod( intervalType, getPlan( selectedPlan )?.term );
		const plansFromProps = this.getPlansFromProps( GROUP_WPCOM, term );

		let plans;
		if ( plansFromProps.length ) {
			plans = plansFromProps;
		} else {
			const isBloggerPlanVisible = hideBloggerPlan === true ? false : true;
			const isEnterprisePlanVisible = is2023OnboardingPricingGrid && isInSignup;
			plans = [
				findPlansKeys( { group: GROUP_WPCOM, type: TYPE_FREE } )[ 0 ],
				isBloggerPlanVisible &&
					findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_BLOGGER } )?.[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_BUSINESS } )[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_ECOMMERCE } )[ 0 ],
				isEnterprisePlanVisible &&
					findPlansKeys( { group: GROUP_WPCOM, type: TYPE_ENTERPRISE_GRID_WPCOM } )[ 0 ],
			].filter( ( el ) => el );
		}

		if ( hideFreePlan ) {
			plans = plans.filter( ( planSlug ) => ! isFreePlan( planSlug ) );
		}

		if ( hidePersonalPlan ) {
			plans = plans.filter( ( planSlug ) => ! isPersonalPlan( planSlug ) );
		}

		if ( hidePremiumPlan ) {
			plans = plans.filter( ( planSlug ) => ! isPremiumPlan( planSlug ) );
		}

		if ( isNewsletterOrLinkInBioFlow( flowName ) ) {
			plans = plans.filter(
				( planSlug ) => ! isBusinessPlan( planSlug ) && ! isEcommercePlan( planSlug )
			);
		}

		if ( ! isEnabled( 'plans/personal-plan' ) ) {
			plans.splice( plans.indexOf( plans.filter( ( p ) => p === PLAN_PERSONAL )[ 0 ] ), 1 );
		}

		if ( showTreatmentPlansReorderTest ) {
			return plans.reverse();
		}
		return plans;
	}

	getPlansFromProps( group, term ) {
		const planTypes = this.props.planTypes || [];

		return planTypes.reduce( ( accum, type ) => {
			const plan = findPlansKeys( { group, term, type } )[ 0 ];

			if ( ! plan ) {
				warn(
					`Invalid plan type, \`${ type }\`, provided to \`PlansFeaturesMain\` component. See plans constants for valid plan types.`
				);
			}

			return plan ? [ ...accum, plan ] : accum;
		}, [] );
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
			is2023OnboardingPricingGrid,
		} = this.props;

		const isPlanOneOfType = ( plan, types ) =>
			types.filter( ( type ) => planMatches( plan, { type } ) ).length > 0;

		const plans = this.isDisplayingPlansNeededForFeature()
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

		if ( is2023OnboardingPricingGrid ) {
			return plans.filter( ( plan ) =>
				isPlanOneOfType( plan, [
					TYPE_FREE,
					TYPE_PERSONAL,
					TYPE_PREMIUM,
					TYPE_BUSINESS,
					TYPE_ECOMMERCE,
					TYPE_ENTERPRISE_GRID_WPCOM,
				] )
			);
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

	renderPlansGrid() {
		const { shouldShowPlansFeatureComparison, is2023OnboardingPricingGrid } = this.props;

		if ( is2023OnboardingPricingGrid ) {
			return this.show2023OnboardingPricingGrid();
		}

		return shouldShowPlansFeatureComparison
			? this.show2023OnboardingPricingGrid()
			: this.getPlanFeatures();
	}

	render() {
		const { siteId, redirectToAddDomainFlow, domainAndPlanPackage } = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
		const kindOfPlanTypeSelector = this.getKindOfPlanTypeSelector( this.props );

		// If advertising plans for a certain feature, ensure user has pressed "View all plans" before they can see others
		let hidePlanSelector =
			kindOfPlanTypeSelector === 'customer' && this.isDisplayingPlansNeededForFeature();

		// In the "purchase a plan and free domain" flow we do not want to show
		// monthly plans because monthly plans do not come with a free domain.
		if ( redirectToAddDomainFlow !== undefined || domainAndPlanPackage ) {
			hidePlanSelector = true;
		}

		return (
			<div className="plans-features-main">
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<HappychatConnection />
				<div className="plans-features-main__notice" />
				{ ! hidePlanSelector && (
					<PlanTypeSelector
						{ ...this.props }
						kind={ kindOfPlanTypeSelector }
						plans={ visiblePlans }
					/>
				) }
				{ this.renderPlansGrid() }
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
	domainAndPlanPackage: PropTypes.string,
	basePlansPath: PropTypes.string,
	hideFreePlan: PropTypes.bool,
	hidePersonalPlan: PropTypes.bool,
	hidePremiumPlan: PropTypes.bool,
	customerType: PropTypes.string,
	flowName: PropTypes.string,
	intervalType: PropTypes.oneOf( [ 'monthly', 'yearly' ] ),
	isChatAvailable: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,

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
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	hidePersonalPlan: false,
	hidePremiumPlan: false,
	intervalType: 'yearly',
	isChatAvailable: false,
	showFAQ: true,
	siteId: null,
	siteSlug: '',
	plansWithScroll: false,
	isReskinned: false,
	planTypeSelector: 'interval',
	isPlansInsideStepper: false,
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
		const is2023OnboardingPricingGrid =
			isEnabled( 'onboarding/2023-pricing-grid' ) &&
			props.flowName === 'onboarding-2023-pricing-grid';
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
			siteSlug: getSiteSlug( state, get( props.site, [ 'ID' ] ) ),
			sitePlanSlug,
			eligibleForWpcomMonthlyPlans,
			titanMonthlyRenewalCost,
			is2023OnboardingPricingGrid,
			showFAQ: props.showFAQ && ! is2023OnboardingPricingGrid,
		};
	},
	{
		selectHappychatSiteId,
	}
)( localize( PlansFeaturesMain ) );
