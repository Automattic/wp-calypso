/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get, compact } from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * WordPress dependencies
 */
import warn from '@wordpress/warning';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import PlanFeatures from 'calypso/my-sites/plan-features';
import PlanFeaturesComparison from 'calypso/my-sites/plan-features-comparison';
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
	isWpComFreePlan,
	isWpComMonthlyPlan,
	planMatches,
	JETPACK_PLANS,
	PLAN_JETPACK_PERSONAL,
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
	GROUP_JETPACK,
	PLAN_PERSONAL,
	JETPACK_PRODUCTS_LIST,
	JETPACK_PRODUCT_PRICE_MATRIX,
	getJetpackProducts,
} from '@automattic/calypso-products';
import JetpackFAQ from './jetpack-faq';
import PlansFeaturesMainProductsHeader from './products-header';
import WpcomFAQ from './wpcom-faq';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySites from 'calypso/components/data/query-sites';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { isEnabled } from '@automattic/calypso-config';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import { Button } from '@automattic/components';
import ProductSelector from 'calypso/blocks/product-selector';
import FormattedHeader from 'calypso/components/formatted-header';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import { getDiscountByName } from 'calypso/lib/discounts';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getSitePlan,
	getSiteSlug,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'calypso/state/sites/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getTld } from 'calypso/lib/domains';
import { isDiscountActive } from 'calypso/state/selectors/get-active-discount.js';
import { selectSiteId as selectHappychatSiteId } from 'calypso/state/help/actions';
import { getABTestVariation } from 'calypso/lib/abtest';
import PlanTypeSelector from './plan-type-selector';

/**
 * Style dependencies
 */
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

	isJetpackBackupAvailable() {
		const { displayJetpackPlans, isMultisite } = this.props;

		// Jetpack Backup does not support Multisite yet.
		if ( isMultisite ) {
			return false;
		}

		// Only for Jetpack, non-atomic sites
		if ( ! displayJetpackPlans ) {
			return false;
		}

		return true;
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
			displayJetpackPlans,
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
					'is-' + ( displayJetpackPlans ? 'jetpack' : 'wpcom' ),
					{
						[ `is-customer-${ customerType }` ]: ! displayJetpackPlans,
						'is-scrollable': plansWithScroll,
					}
				) }
				data-e2e-plans={ displayJetpackPlans ? 'jetpack' : 'wpcom' }
			>
				<PlanFeaturesComparison
					basePlansPath={ basePlansPath }
					displayJetpackPlans={ displayJetpackPlans }
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
			customerType,
			disableBloggerPlanWithNonBlogDomain,
			displayJetpackPlans,
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
			isInVerticalScrollingPlansExperiment,
			redirectToAddDomainFlow,
		} = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );

		return (
			<div
				className={ classNames(
					'plans-features-main__group',
					'is-' + ( displayJetpackPlans ? 'jetpack' : 'wpcom' ),
					{
						[ `is-customer-${ customerType }` ]: ! displayJetpackPlans,
						'is-scrollable': plansWithScroll,
					}
				) }
				data-e2e-plans={ displayJetpackPlans ? 'jetpack' : 'wpcom' }
			>
				{ this.renderSecondaryFormattedHeader() }
				<PlanFeatures
					redirectToAddDomainFlow={ redirectToAddDomainFlow }
					basePlansPath={ basePlansPath }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					displayJetpackPlans={ displayJetpackPlans }
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
						customerType,
						isJetpack,
						availablePlans: visiblePlans,
					} ) }
					siteId={ siteId }
					isReskinned={ isReskinned }
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
			displayJetpackPlans,
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
		const group = displayJetpackPlans ? GROUP_JETPACK : GROUP_WPCOM;
		const plansFromProps = this.getPlansFromProps( group, term );

		let plans;
		if ( plansFromProps.length ) {
			plans = plansFromProps;
		} else if ( group === GROUP_JETPACK ) {
			plans = compact( [
				findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
				( isEnabled( 'jetpack/personal-plan' ) || PLAN_JETPACK_PERSONAL === sitePlanSlug ) &&
					findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_BUSINESS } )[ 0 ],
			] );
		} else {
			plans = [
				findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
				hideBloggerPlan ? null : findPlansKeys( { group, term, type: TYPE_BLOGGER } )?.[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_BUSINESS } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_ECOMMERCE } )[ 0 ],
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

		if ( ! isEnabled( 'plans/personal-plan' ) && ! displayJetpackPlans ) {
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
			displayJetpackPlans,
			customerType,
			selectedPlan,
			plansWithScroll,
			withWPPlanTabs,
			isAllPaidPlansShown,
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

		if ( displayJetpackPlans ) {
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

		if ( ! withWPPlanTabs || isAllPaidPlansShown || withIntervalSelector ) {
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
		if ( this.isJetpackBackupAvailable() ) {
			headerText = translate( 'Plans' );
			subHeaderText = translate(
				'Get everything your site needs, in one package — so you can focus on your business.'
			);
		}
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

	renderProductsSelector() {
		if ( ! this.isJetpackBackupAvailable() ) {
			return null;
		}

		const { basePlansPath, intervalType, redirectTo, onUpgradeClick } = this.props;

		return (
			<div className="plans-features-main__group is-jetpack-products">
				<PlansFeaturesMainProductsHeader />
				<AsyncLoad
					require="calypso/blocks/product-plan-overlap-notices"
					placeholder={ null }
					plans={ JETPACK_PLANS }
					products={ JETPACK_PRODUCTS_LIST }
				/>
				<ProductSelector
					products={ getJetpackProducts() }
					intervalType={ intervalType }
					basePlansPath={ basePlansPath }
					productPriceMatrix={ JETPACK_PRODUCT_PRICE_MATRIX }
					redirectTo={ redirectTo }
					onUpgradeClick={ onUpgradeClick }
				/>
			</div>
		);
	}

	mayRenderFAQ() {
		const { displayJetpackPlans, isInSignup } = this.props;

		if ( isInSignup ) {
			return null;
		}

		return displayJetpackPlans ? <JetpackFAQ /> : <WpcomFAQ />;
	}

	getKindOfPlanTypeSelector( props ) {
		if (
			props.displayJetpackPlans ||
			props.isInSignup ||
			props.eligibleForWpcomMonthlyPlans ||
			props.redirectToAddDomainFlow
		) {
			return 'interval';
		}

		if ( props.withWPPlanTabs && ! props.hidePersonalPlan ) {
			return 'customer';
		}

		return 'interval';
	}

	render() {
		const {
			siteId,
			customHeader,
			redirectToAddDomainFlow,
			shouldShowPlansFeatureComparison,
		} = this.props;
		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
		const kindOfPlanTypeSelector = this.getKindOfPlanTypeSelector( this.props );

		// If advertising plans for a certain feature, ensure user has pressed "View all plans" before they can see others
		let hidePlanSelector =
			kindOfPlanTypeSelector === 'customer' && this.isDisplayingPlansNeededForFeature();

		// In the "purchase a plan and free domain" flow we do not want to show
		// monthly plans because monthly plans do not come with a free domain.
		if ( redirectToAddDomainFlow ) {
			hidePlanSelector = true;
		}

		return (
			<div className="plans-features-main">
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<HappychatConnection />
				<div className="plans-features-main__notice" />

				{ customHeader }
				{ ! hidePlanSelector && (
					<PlanTypeSelector
						{ ...this.props }
						kind={ kindOfPlanTypeSelector }
						plans={ visiblePlans }
					/>
				) }
				{ shouldShowPlansFeatureComparison ? this.showFeatureComparison() : this.getPlanFeatures() }
				{ this.renderProductsSelector() }
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
	displayJetpackPlans: PropTypes.bool.isRequired,
	hideFreePlan: PropTypes.bool,
	hidePersonalPlan: PropTypes.bool,
	hidePremiumPlan: PropTypes.bool,
	customerType: PropTypes.string,
	flowName: PropTypes.string,
	intervalType: PropTypes.string,
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
	withWPPlanTabs: PropTypes.bool,
	isAllPaidPlansShown: PropTypes.bool,
	plansWithScroll: PropTypes.bool,
	planTypes: PropTypes.array,
	customHeader: PropTypes.node,
	isReskinned: PropTypes.bool,
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
	withWPPlanTabs: false,
	plansWithScroll: false,
	isReskinned: false,
};

export default connect(
	( state, props ) => {
		const siteId = get( props.site, [ 'ID' ] );
		const currentPlan = getSitePlan( state, siteId );
		const sitePlanSlug = currentPlan?.product_slug;
		const eligibleForWpcomMonthlyPlans =
			isWpComFreePlan( sitePlanSlug ) || isWpComMonthlyPlan( sitePlanSlug );

		const customerType = chooseDefaultCustomerType( {
			currentCustomerType: props.customerType,
			selectedPlan: props.selectedPlan,
			currentPlan,
		} );

		const isReskinned =
			props.isInSignup &&
			'onboarding' === props.flowName &&
			'reskinned' === getABTestVariation( 'reskinSignupFlow' );

		return {
			// This is essentially a hack - discounts are the only endpoint that we can rely on both on /plans and
			// during the signup, and we're going to remove the code soon after the test. Also, since this endpoint is
			// pretty versatile, we could rename it from discounts to flags/features/anything else and make it more
			// universal.
			withWPPlanTabs: isDiscountActive( getDiscountByName( 'new_plans' ), state ),
			plansWithScroll: ! props.displayJetpackPlans && props.plansWithScroll,
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
			isReskinned,
		};
	},
	{
		selectHappychatSiteId,
	}
)( localize( PlansFeaturesMain ) );
