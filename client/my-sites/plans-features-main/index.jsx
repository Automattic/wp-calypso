import {
	chooseDefaultCustomerType,
	findPlansKeys,
	getPlan,
	getPopularPlanSpec,
	isFreePlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	isProPlan,
	isStarterPlan,
	planMatches,
	TYPE_FREE,
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
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { WpcomPlansUI } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import warn from '@wordpress/warning';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import { planItem as getCartItemForPlan } from 'calypso/lib/cart-values/cart-items';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import PlanNotice from 'calypso/my-sites/plans-features-main/components/plan-notice';
import PlanTypeSelector from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
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
import useIntentFromSiteMeta from './hooks/use-intent-from-site-meta';
import usePlanTypesWithIntent from './hooks/use-plan-types-with-intent';

const OnboardingPricingGrid2023 = ( props ) => {
	const {
		plans,
		visiblePlans,
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
		isPlansInsideStepper,
		intervalType,
		planTypeSelectorProps,
		hidePlansFeatureComparison, // TODO clk
		replacePaidDomainWithFreeDomain,
		sitePlanSlug,
		translate,
		siteSlug,
		intent,
	} = props;

	// const [ hidePlansFeatureComparison, setHidePlansFeatureComparison ] = useState(
	// 	props.hidePlansFeatureComparison
	// );

	// useEffect( () => {
	// 	if ( ! hidePlansFeatureComparison ) {
	// 		setHidePlansFeatureComparison( 'newsletter' === intent );
	// 	}
	// }, [ hidePlansFeatureComparison, intent ] );

	const { setShowDomainUpsellDialog } = useDispatch( WpcomPlansUI.store );
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const showDomainUpsellDialog = useCallback( () => {
		setShowDomainUpsellDialog( true );
	}, [ setShowDomainUpsellDialog ] );

	let planActionOverrides;
	if ( sitePlanSlug && isFreePlan( sitePlanSlug ) ) {
		planActionOverrides = {
			loggedInFreePlan: domainFromHomeUpsellFlow
				? {
						callback: showDomainUpsellDialog,
						text: translate( 'Keep my plan', { context: 'verb' } ),
				  }
				: {
						callback: () => {
							page.redirect( `/add-ons/${ siteSlug }` );
						},
						text: translate( 'Manage add-ons', { context: 'verb' } ),
				  },
		};
	}

	const asyncProps = {
		basePlansPath,
		domainName,
		isInSignup,
		isLandingPage,
		isLaunchPage,
		onUpgradeClick,
		plans, // We need all the plans in order to show the correct features in the plan comparison table
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
		planActionOverrides,
		intent,
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
};

const SecondaryFormattedHeader = ( { siteSlug } ) => {
	const translate = useTranslate();
	const headerText = translate( 'Upgrade your plan to access this feature and more' );
	const subHeaderText = (
		<Button className="plans-features-main__view-all-plans is-link" href={ `/plans/${ siteSlug }` }>
			{ translate( 'View all plans' ) }
		</Button>
	);

	return (
		<FormattedHeader
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			compactOnMobile
			isSecondary
		/>
	);
};

const PricingView = ( props ) => {
	const {
		isDisplayingPlansNeededForFeature,
		planTypeSelector,
		planTypeSelectorProps,
		hidePlanSelector,
		siteId,
		siteSlug,
		isInSignup,
		withDiscount,
		discountEndDate,
		selectedPlan,
		hideFreePlan,
		hidePersonalPlan,
		hidePremiumPlan,
		hideBusinessPlan,
		hideEcommercePlan,
		sitePlanSlug,
		hideEnterprisePlan,
		intent: intentFromProps,
		currentSitePlanSlug,
	} = props;
	const getPlanBillingPeriod = ( intervalType, defaultValue = null ) => {
		const plans = {
			monthly: TERM_MONTHLY,
			yearly: TERM_ANNUALLY,
			'2yearly': TERM_BIENNIALLY,
			'3yearly': TERM_TRIENNIALLY,
		};

		return plans[ intervalType ] || defaultValue || TERM_ANNUALLY;
	};
	const getPlansFromTypes = ( planTypes, group, term ) => {
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
	};
	const getVisiblePlansForPlanFeatures = ( availablePlans ) => {
		const isPlanOneOfType = ( plan, types ) =>
			types.filter( ( type ) => planMatches( plan, { type } ) ).length > 0;

		let plans = isDisplayingPlansNeededForFeature
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

		if ( hideBusinessPlan ) {
			plans = plans.filter( ( planSlug ) => ! isBusinessPlan( planSlug ) );
		}

		if ( hideEcommercePlan ) {
			plans = plans.filter( ( planSlug ) => ! isEcommercePlan( planSlug ) );
		}

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
	};

	const term = getPlanBillingPeriod( props.intervalType, getPlan( selectedPlan )?.term );
	const intentFromSiteMeta = useIntentFromSiteMeta();
	const intent = intentFromProps || intentFromSiteMeta.intent || 'default';
	const defaultPlanTypes = usePlanTypesWithIntent( {
		intent: 'default',
		selectedPlan,
		sitePlanSlug,
		hideEnterprisePlan,
		currentSitePlanSlug,
	} );
	const visiblePlanTypes = usePlanTypesWithIntent( {
		intent,
		selectedPlan,
		sitePlanSlug,
		hideEnterprisePlan,
		currentSitePlanSlug,
	} );
	const plans = defaultPlanTypes?.planTypes
		? getPlansFromTypes( defaultPlanTypes.planTypes, GROUP_WPCOM, term )
		: null;
	const visiblePlans = visiblePlanTypes?.planTypes
		? getVisiblePlansForPlanFeatures(
				getPlansFromTypes( visiblePlanTypes.planTypes, GROUP_WPCOM, term )
		  )
		: null;

	return (
		<>
			<PlanNotice
				visiblePlans={ visiblePlans }
				siteId={ siteId }
				isInSignup={ isInSignup }
				discountInformation={ {
					withDiscount,
					discountEndDate,
				} }
			/>
			{ isDisplayingPlansNeededForFeature && <SecondaryFormattedHeader siteSlug={ siteSlug } /> }
			{ ! intentFromSiteMeta.processing && (
				<>
					{ ! hidePlanSelector && (
						<PlanTypeSelector
							{ ...planTypeSelectorProps }
							kind={ planTypeSelector }
							plans={ visiblePlans }
						/>
					) }
					<OnboardingPricingGrid2023
						{ ...props }
						plans={ plans }
						visiblePlans={ visiblePlans }
						intent={ visiblePlanTypes.intent }
					/>
				</>
			) }
		</>
	);
};

export class PlansFeaturesMain extends Component {
	state = {
		isFreePlanPaidDomainDialogOpen: false,
	};

	isDisplayingPlansNeededForFeature() {
		const { selectedFeature, selectedPlan, previousRoute, planTypeSelector } = this.props;

		if (
			isValidFeatureKey( selectedFeature ) &&
			getPlan( selectedPlan ) &&
			! isPersonalPlan( selectedPlan ) &&
			( 'interval' === planTypeSelector || ! previousRoute.startsWith( '/plans/' ) )
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

	isPersonalCustomerTypePlanVisible() {
		const { hidePersonalPlan } = this.props;
		return ! hidePersonalPlan;
	}

	render() {
		const { siteId, redirectToAddDomainFlow, hidePlanTypeSelector, planTypeSelector } = this.props;

		// If advertising plans for a certain feature, ensure user has pressed "View all plans" before they can see others
		let hidePlanSelector =
			'customer' === planTypeSelector && this.isDisplayingPlansNeededForFeature();

		// In the "purchase a plan and free domain" flow we do not want to show
		// monthly plans because monthly plans do not come with a free domain.
		if ( redirectToAddDomainFlow !== undefined || hidePlanTypeSelector ) {
			hidePlanSelector = true;
		}

		return (
			<div
				className={ classNames(
					'plans-features-main',
					'is-pricing-grid-2023-plans-features-main'
				) }
			>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<PricingView
					{ ...this.props }
					isDisplayingPlansNeededForFeature={ this.isDisplayingPlansNeededForFeature() }
					onUpgradeClick={ this.onUpgradeClick }
					hidePlanSelector={ hidePlanSelector }
				/>
				{ this.state.isFreePlanPaidDomainDialogOpen && this.renderFreePlanPaidDomainModal() }
			</div>
		);
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
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	isStepperUpgradeFlow: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	redirectTo: PropTypes.string,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	isAllPaidPlansShown: PropTypes.bool,
	plansWithScroll: PropTypes.bool,
	planTypes: PropTypes.array,
	isReskinned: PropTypes.bool,
	isPlansInsideStepper: PropTypes.bool,
	planTypeSelector: PropTypes.string,
	busyOnUpgradeClick: PropTypes.bool,
	intent: PropTypes.oneOf( [
		'blog-onboarding',
		'newsletter',
		'link-in-bio',
		'new-hosted-site',
		'new-hosted-site-hosting-flow',
		'plugins',
		'jetpack-app',
		'plans-import',
		'plans-ecommerce',
		'default',
	] ),
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	hidePersonalPlan: false,
	hidePremiumPlan: false,
	hideEnterprisePlan: false,
	intervalType: 'yearly',
	siteId: null,
	siteSlug: '',
	plansWithScroll: false,
	isReskinned: false,
	planTypeSelector: 'interval',
	isPlansInsideStepper: false,
	busyOnUpgradeClick: false,
	isStepperUpgradeFlow: false,
};

export default connect( ( state, props ) => {
	const siteId = get( props.site, [ 'ID' ] );
	const sitePlan = getSitePlan( state, siteId );
	const currentPlan = getCurrentPlan( state, siteId );
	const currentPurchase = getByPurchaseId( state, currentPlan?.id );
	const sitePlanSlug = sitePlan?.product_slug;
	const eligibleForWpcomMonthlyPlans = isEligibleForWpComMonthlyPlan( state, siteId );
	const siteSlug = getSiteSlug( state, get( props.site, [ 'ID' ] ) );
	const intent = props.intent || 'default';

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
		selectedPlan: props.selectedPlan,
		selectedFeature: props.selectedFeature,
	};

	return {
		isCurrentPlanRetired: isProPlan( sitePlanSlug ) || isStarterPlan( sitePlanSlug ),
		currentPurchaseIsInAppPurchase: currentPurchase?.isInAppPurchase,
		customerType,
		domains: getDomainsBySiteId( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		isMultisite: isJetpackSiteMultiSite( state, siteId ),
		previousRoute: getPreviousRoute( state ),
		siteId,
		siteSlug,
		sitePlanSlug,
		eligibleForWpcomMonthlyPlans,
		planTypeSelectorProps,
		intent,
	};
} )( localize( PlansFeaturesMain ) );
