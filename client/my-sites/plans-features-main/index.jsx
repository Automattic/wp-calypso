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
	TERM_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	GROUP_WPCOM,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import warn from '@wordpress/warning';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
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

	showFeatureComparison() {
		const {
			basePlansPath,
			customerType,
			domainName,
			isInSignup,
			isJetpack,
			isLandingPage,
			isLaunchPage,
			onUpgradeClick,
			selectedFeature,
			selectedPlan,
			withDiscount,
			discountEndDate,
			redirectTo,
			siteId,
			plansWithScroll,
			isReskinned,
		} = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );

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
					redirectTo={ redirectTo }
					visiblePlans={ visiblePlans }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					discountEndDate={ discountEndDate }
					withScroll={ plansWithScroll }
					popularPlanSpec={ getPopularPlanSpec( {
						customerType,
						isJetpack,
						availablePlans: visiblePlans,
					} ) }
					siteId={ siteId }
					isReskinned={ isReskinned }
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
			isProfessionalEmailPromotionAvailable,
			redirectToAddDomainFlow,
			translate,
		} = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
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
				{ isCurrentPlanRetired && (
					<Notice
						showDismiss={ false }
						status="is-info"
						text={ translate(
							'Your current plan is no longer available for new subscriptions. ' +
								'You’re all set to continue with the plan for as long as you like. ' +
								'Alternatively, you can switch to any of our current plans by selecting it below. ' +
								'Please keep in mind that switching plans will be irreversible.'
						) }
					/>
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
					basePlansPath={ basePlansPath }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					domainName={ domainName }
					nonDotBlogDomains={ this.filterDotBlogDomains() }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					isProfessionalEmailPromotionAvailable={ isProfessionalEmailPromotionAvailable }
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
						customerType,
						isJetpack,
						availablePlans: visiblePlans,
					} ) }
					siteId={ siteId }
					isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
					kindOfPlanTypeSelector={ this.getKindOfPlanTypeSelector( this.props ) }
				/>
			</div>
		);
	}

	getPlanBillingPeriod( intervalType, defaultValue = null ) {
		const plans = {
			monthly: TERM_MONTHLY,
			yearly: TERM_ANNUALLY,
			'2yearly': TERM_BIENNIALLY,
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
		} = this.props;

		const hideBloggerPlan = ! isBloggerPlan( selectedPlan ) && ! isBloggerPlan( sitePlanSlug );
		const term = this.getPlanBillingPeriod( intervalType, getPlan( selectedPlan )?.term );
		const plansFromProps = this.getPlansFromProps( GROUP_WPCOM, term );

		let plans;
		if ( plansFromProps.length ) {
			plans = plansFromProps;
		} else {
			plans = [
				findPlansKeys( { group: GROUP_WPCOM, type: TYPE_FREE } )[ 0 ],
				hideBloggerPlan
					? null
					: findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_BLOGGER } )?.[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_BUSINESS } )[ 0 ],
				findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_ECOMMERCE } )[ 0 ],
			].filter( ( el ) => el !== null );
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
		const { customerType, selectedPlan, plansWithScroll, isAllPaidPlansShown } = this.props;

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
		const { isInSignup } = this.props;

		if ( isInSignup ) {
			return null;
		}

		return <WpcomFAQ />;
	}

	getKindOfPlanTypeSelector( props ) {
		return props.planTypeSelector;
	}

	render() {
		const { siteId, redirectToAddDomainFlow, shouldShowPlansFeatureComparison } = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
		const kindOfPlanTypeSelector = this.getKindOfPlanTypeSelector( this.props );

		// If advertising plans for a certain feature, ensure user has pressed "View all plans" before they can see others
		let hidePlanSelector =
			kindOfPlanTypeSelector === 'customer' && this.isDisplayingPlansNeededForFeature();

		// In the "purchase a plan and free domain" flow we do not want to show
		// monthly plans because monthly plans do not come with a free domain.
		if ( redirectToAddDomainFlow !== undefined ) {
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
				{ shouldShowPlansFeatureComparison ? this.showFeatureComparison() : this.getPlanFeatures() }
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
	basePlansPath: PropTypes.string,
	hideFreePlan: PropTypes.bool,
	hidePersonalPlan: PropTypes.bool,
	hidePremiumPlan: PropTypes.bool,
	customerType: PropTypes.string,
	flowName: PropTypes.string,
	intervalType: PropTypes.string,
	isChatAvailable: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	isProfessionalEmailPromotionAvailable: PropTypes.bool,
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
	planTypeSelector: PropTypes.string,
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	hidePersonalPlan: false,
	hidePremiumPlan: false,
	intervalType: 'yearly',
	isChatAvailable: false,
	isProfessionalEmailPromotionAvailable: false,
	showFAQ: true,
	siteId: null,
	siteSlug: '',
	plansWithScroll: false,
	isReskinned: false,
	planTypeSelector: 'interval',
};

export default connect(
	( state, props ) => {
		const siteId = get( props.site, [ 'ID' ] );
		const sitePlan = getSitePlan( state, siteId );
		const currentPlan = getCurrentPlan( state, siteId );
		const currentPurchase = getByPurchaseId( state, currentPlan?.id );
		const sitePlanSlug = sitePlan?.product_slug;
		const eligibleForWpcomMonthlyPlans = isEligibleForWpComMonthlyPlan( state, siteId );

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
		};
	},
	{
		selectHappychatSiteId,
	}
)( localize( PlansFeaturesMain ) );
