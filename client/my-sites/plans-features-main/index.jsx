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
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import warn from 'lib/warn';
import PlanFeatures from 'my-sites/plan-features';
import {
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
	PLAN_P2_PLUS,
} from 'lib/plans/constants';
import { JETPACK_PRODUCTS_LIST, JETPACK_PRODUCT_PRICE_MATRIX } from 'lib/products-values/constants';
import { getJetpackProducts } from 'lib/products-values/translations';
import { addQueryArgs } from 'lib/url';
import JetpackFAQ from './jetpack-faq';
import PlansFeaturesMainProductsHeader from './products-header';
import WpcomFAQ from './wpcom-faq';
import CartData from 'components/data/cart';
import QueryPlans from 'components/data/query-plans';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { isEnabled } from 'config';
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
	planMatches,
	plansLink,
} from 'lib/plans';
import { isValidFeatureKey } from 'lib/plans/features-list';
import { Button } from '@automattic/components';
import SegmentedControl from 'components/segmented-control';
import PaymentMethods from 'blocks/payment-methods';
import ProductSelector from 'blocks/product-selector';
import FormattedHeader from 'components/formatted-header';
import HappychatConnection from 'components/happychat/connection-connected';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import { getDiscountByName } from 'lib/discounts';
import { getDomainsBySiteId } from 'state/sites/domains/selectors';
import {
	getSitePlan,
	getSiteSlug,
	isJetpackSite,
	isJetpackSiteMultiSite,
} from 'state/sites/selectors';
import getPreviousRoute from 'state/selectors/get-previous-route';
import { getTld } from 'lib/domains';
import { isDiscountActive } from 'state/selectors/get-active-discount.js';
import { selectSiteId as selectHappychatSiteId } from 'state/help/actions';
import { getABTestVariation } from 'lib/abtest';

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
			! previousRoute.startsWith( '/plans/' )
		) {
			return true;
		}
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
			customHeader,
			isReskinned,
		} = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
		const availablePlans = this.isDisplayingPlansNeededForFeature()
			? visiblePlans.filter( ( plan ) => {
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
			: visiblePlans;

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
				{ customHeader }
				{ this.renderSecondaryFormattedHeader() }
				<PlanFeatures
					basePlansPath={ basePlansPath }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					displayJetpackPlans={ displayJetpackPlans }
					domainName={ domainName }
					nonDotBlogDomains={ this.filterDotBlogDomains() }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					onUpgradeClick={ onUpgradeClick }
					plans={ [ ...plans, PLAN_P2_PLUS ] }
					redirectTo={ redirectTo }
					visiblePlans={ [ ...availablePlans, PLAN_P2_PLUS ] }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					discountEndDate={ discountEndDate }
					withScroll={ plansWithScroll }
					popularPlanSpec={ getPopularPlanSpec( {
						customerType,
						isJetpack,
						availablePlans,
					} ) }
					siteId={ siteId }
					isReskinned={ isReskinned }
				/>
			</div>
		);
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
		} = this.props;

		const currentPlan = getPlan( selectedPlan );

		const hideBloggerPlan = ! isBloggerPlan( selectedPlan ) && ! isBloggerPlan( sitePlanSlug );

		let term;
		if ( intervalType === 'monthly' ) {
			term = TERM_MONTHLY;
		} else if ( intervalType === 'yearly' ) {
			term = TERM_ANNUALLY;
		} else if ( intervalType === '2yearly' ) {
			term = TERM_BIENNIALLY;
		} else if ( currentPlan ) {
			term = currentPlan.term;
		} else {
			term = TERM_ANNUALLY;
		}

		const group = displayJetpackPlans ? GROUP_JETPACK : GROUP_WPCOM;

		// In WPCOM, only the business plan is available in monthly term
		// For any other plan, switch to annually.
		const businessPlanTerm = term;
		if ( group === GROUP_WPCOM && term === TERM_MONTHLY ) {
			term = TERM_ANNUALLY;
		}

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
				hideBloggerPlan ? null : findPlansKeys( { group, term, type: TYPE_BLOGGER } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group, term: businessPlanTerm, type: TYPE_BUSINESS } )[ 0 ],
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

	getVisiblePlansForPlanFeatures( plans ) {
		const { displayJetpackPlans, customerType, plansWithScroll, withWPPlanTabs } = this.props;

		const isPlanOneOfType = ( plan, types ) =>
			types.filter( ( type ) => planMatches( plan, { type } ) ).length > 0;

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

		if ( ! withWPPlanTabs ) {
			return plans.filter( ( plan ) =>
				isPlanOneOfType( plan, [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ] )
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

	constructPath( plansUrl, intervalType, customerType = '' ) {
		const { selectedFeature, selectedPlan, siteSlug, withDiscount } = this.props;

		return addQueryArgs(
			{
				customerType,
				feature: selectedFeature,
				plan: selectedPlan,
				discount: withDiscount,
			},
			plansLink( plansUrl, siteSlug, intervalType, true )
		);
	}

	getIntervalTypeToggle() {
		const { basePlansPath, intervalType, translate } = this.props;
		const segmentClasses = classNames( 'plan-features__interval-type', 'price-toggle' );

		let plansUrl = '/plans';

		if ( basePlansPath ) {
			plansUrl = basePlansPath;
		}

		return (
			<SegmentedControl compact className={ segmentClasses } primary={ true }>
				<SegmentedControl.Item
					selected={ intervalType === 'monthly' }
					path={ this.constructPath( plansUrl, 'monthly' ) }
				>
					{ translate( 'Monthly billing' ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalType === 'yearly' }
					path={ this.constructPath( plansUrl, 'yearly' ) }
				>
					{ translate( 'Yearly billing' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		);
	}

	getCustomerTypeToggle() {
		const { customerType, translate, withDiscount } = this.props;
		const segmentClasses = classNames( 'plan-features__interval-type', 'is-customer-type-toggle' );
		const queryArgs = {
			discount: withDiscount,
		};

		return (
			<SegmentedControl className={ segmentClasses } primary={ true }>
				<SegmentedControl.Item
					selected={ customerType === 'personal' }
					path={ addQueryArgs(
						{ ...queryArgs, customerType: 'personal' },
						document.location.search
					) }
				>
					{ translate( 'Blogs and personal sites' ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ customerType === 'business' }
					path={ addQueryArgs(
						{ ...queryArgs, customerType: 'business' },
						document.location.search
					) }
				>
					{ translate( 'Business sites and online stores' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		);
	}

	handleFreePlanButtonClick = () => {
		const { onUpgradeClick } = this.props;
		onUpgradeClick && onUpgradeClick( null );
	};

	renderFreePlanBanner() {
		const { hideFreePlan, translate, flowName, isInSignup, customHeader, isReskinned } = this.props;
		const className = 'is-free-plan';
		const callToAction =
			isInSignup && flowName === 'launch-site'
				? translate( 'Continue with your free site' )
				: translate( 'Start with a free site' );

		if ( hideFreePlan || !! customHeader ) {
			return null;
		}

		return (
			<div className="plans-features-main__banner">
				<div className="plans-features-main__banner-content">
					<span>{ translate( 'Not sure yet?' ) }</span>
					<Button
						className={ className }
						onClick={ this.handleFreePlanButtonClick }
						borderless={ ! isReskinned }
					>
						{ callToAction }
					</Button>
				</div>
			</div>
		);
	}

	renderToggle() {
		const { displayJetpackPlans, withWPPlanTabs } = this.props;

		if ( this.isDisplayingPlansNeededForFeature() ) {
			return null;
		}
		if ( displayJetpackPlans ) {
			return this.getIntervalTypeToggle();
		}
		if ( withWPPlanTabs && this.isPersonalCustomerTypePlanVisible() ) {
			return this.getCustomerTypeToggle();
		}
		return false;
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
					require="blocks/product-plan-overlap-notices"
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

	render() {
		const { displayJetpackPlans, isInSignup, siteId, plansWithScroll } = this.props;
		let faqs = null;

		if ( ! isInSignup ) {
			faqs = displayJetpackPlans ? <JetpackFAQ /> : <WpcomFAQ />;
		}

		return (
			<div className="plans-features-main">
				<HappychatConnection />
				<div className="plans-features-main__notice" />
				{ ! plansWithScroll && this.renderToggle() }
				{ plansWithScroll && this.renderFreePlanBanner() }
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				{ this.getPlanFeatures() }
				{ this.renderProductsSelector() }
				<CartData>
					<PaymentMethods />
				</CartData>
				{ faqs }
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
			sitePlanSlug: currentPlan && currentPlan.product_slug,
			isReskinned,
		};
	},
	{
		selectHappychatSiteId,
	}
)( localize( PlansFeaturesMain ) );
