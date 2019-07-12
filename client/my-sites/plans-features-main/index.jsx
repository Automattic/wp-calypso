/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';
import PlanFeatures from 'my-sites/plan-features';
import {
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
} from 'lib/plans/constants';
import { addQueryArgs } from 'lib/url';
import JetpackFAQ from './jetpack-faq';
import WpcomFAQ from './wpcom-faq';
import CartData from 'components/data/cart';
import QueryPlans from 'components/data/query-plans';
import QuerySitePlans from 'components/data/query-site-plans';
import { isEnabled } from 'config';
import {
	chooseDefaultCustomerType,
	findPlansKeys,
	getPlan,
	getPopularPlanSpec,
	isFreePlan,
	isBloggerPlan,
	planMatches,
	plansLink,
} from 'lib/plans';
import Button from 'components/button';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import PaymentMethods from 'blocks/payment-methods';
import HappychatConnection from 'components/happychat/connection-connected';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import { getDiscountByName } from 'lib/discounts';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import { getSiteOption, getSitePlan, getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { getSiteType as getSignupSiteType } from 'state/signup/steps/site-type/selectors';
import { getTld } from 'lib/domains';
import { isDiscountActive } from 'state/selectors/get-active-discount.js';
import { selectSiteId as selectHappychatSiteId } from 'state/help/actions';
import { abtest } from 'lib/abtest';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';

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
		 * @TODO: When happychat correctly handles site switching, remove selectHappychatSiteId action.
		 */
		const { siteId } = this.props;
		const { siteId: prevSiteId } = prevProps;
		if ( siteId && siteId !== prevSiteId ) {
			this.props.selectHappychatSiteId( siteId );
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
			siteId,
			siteType,
			plansWithScroll,
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
					plans={ plans }
					visiblePlans={ visiblePlans }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					discountEndDate={ discountEndDate }
					withScroll={ plansWithScroll }
					popularPlanSpec={ getPopularPlanSpec( {
						abtest,
						customerType,
						isJetpack,
						siteType,
					} ) }
					siteId={ siteId }
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
			sitePlanSlug,
		} = this.props;

		const currentPlan = getPlan( selectedPlan );

		const hideBloggerPlan =
			! isBloggerPlan( selectedPlan ) &&
			! isBloggerPlan( sitePlanSlug ) &&
			abtest( 'hideBloggerPlan2' ) === 'hide';

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
			plans = [
				findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_BUSINESS } )[ 0 ],
			];
		} else {
			plans = [
				findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
				hideBloggerPlan ? null : findPlansKeys( { group, term, type: TYPE_BLOGGER } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group, term: businessPlanTerm, type: TYPE_BUSINESS } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_ECOMMERCE } )[ 0 ],
			].filter( el => el !== null );
		}

		if ( hideFreePlan ) {
			plans = plans.filter( planSlug => ! isFreePlan( planSlug ) );
		}

		if ( ! isEnabled( 'plans/personal-plan' ) && ! displayJetpackPlans ) {
			plans.splice( plans.indexOf( plans.filter( p => p.type === TYPE_PERSONAL )[ 0 ] ), 1 );
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

	getVisiblePlansForPlanFeatures( plans ) {
		const { displayJetpackPlans, customerType, plansWithScroll, withWPPlanTabs } = this.props;

		const isPlanOneOfType = ( plan, types ) =>
			types.filter( type => planMatches( plan, { type } ) ).length > 0;

		if ( displayJetpackPlans ) {
			return plans;
		}

		if ( plansWithScroll ) {
			return plans.filter( plan =>
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
			return plans.filter( plan =>
				isPlanOneOfType( plan, [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ] )
			);
		}

		if ( customerType === 'personal' ) {
			return plans.filter( plan =>
				isPlanOneOfType( plan, [ TYPE_FREE, TYPE_BLOGGER, TYPE_PERSONAL, TYPE_PREMIUM ] )
			);
		}

		return plans.filter( plan =>
			isPlanOneOfType( plan, [ TYPE_FREE, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ] )
		);
	}

	constructPath( plansUrl, intervalType, customerType = '' ) {
		const { selectedFeature, selectedPlan, siteSlug } = this.props;
		return addQueryArgs(
			{
				customerType,
				feature: selectedFeature,
				plan: selectedPlan,
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
				<SegmentedControlItem
					selected={ intervalType === 'monthly' }
					path={ this.constructPath( plansUrl, 'monthly' ) }
				>
					{ translate( 'Monthly billing' ) }
				</SegmentedControlItem>

				<SegmentedControlItem
					selected={ intervalType === 'yearly' }
					path={ this.constructPath( plansUrl, 'yearly' ) }
				>
					{ translate( 'Yearly billing' ) }
				</SegmentedControlItem>
			</SegmentedControl>
		);
	}

	getCustomerTypeToggle() {
		const { customerType, translate } = this.props;
		const segmentClasses = classNames( 'plan-features__interval-type', 'is-customer-type-toggle' );

		return (
			<SegmentedControl className={ segmentClasses } primary={ true }>
				<SegmentedControlItem
					selected={ customerType === 'personal' }
					path={ '?customerType=personal' }
				>
					{ translate( 'Blogs and Personal Sites' ) }
				</SegmentedControlItem>

				<SegmentedControlItem
					selected={ customerType === 'business' }
					path={ '?customerType=business' }
				>
					{ translate( 'Business Sites and Online Stores' ) }
				</SegmentedControlItem>
			</SegmentedControl>
		);
	}

	handleFreePlanButtonClick = () => {
		const { onUpgradeClick } = this.props;
		onUpgradeClick && onUpgradeClick( null );
	};

	renderFreePlanBanner() {
		const { hideFreePlan, translate, flowName, isInSignup } = this.props;
		const className = 'is-free-plan';
		const callToAction =
			isInSignup && flowName === 'launch-site'
				? translate( 'Continue with your free site' )
				: translate( 'Start with a free site' );

		if ( hideFreePlan ) {
			return null;
		}

		return (
			<div className="plans-features-main__banner">
				<div className="plans-features-main__banner-content">
					{ translate( 'Not sure yet?' ) }
					<Button className={ className } onClick={ this.handleFreePlanButtonClick } borderless>
						{ callToAction }
					</Button>
				</div>
			</div>
		);
	}

	renderToggle() {
		const { displayJetpackPlans, withWPPlanTabs } = this.props;
		if ( displayJetpackPlans ) {
			return this.getIntervalTypeToggle();
		}
		if ( withWPPlanTabs ) {
			return this.getCustomerTypeToggle();
		}
		return false;
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
				<QuerySitePlans siteId={ siteId } />
				{ this.getPlanFeatures() }
				<CartData>
					<PaymentMethods />
				</CartData>
				{ faqs }
			</div>
		);
	}

	filterDotBlogDomains() {
		const domains = get( this.props, 'domains', [] );
		return domains.filter( function( domainInfo ) {
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
	customerType: PropTypes.string,
	flowName: PropTypes.string,
	intervalType: PropTypes.string,
	isChatAvailable: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	showFAQ: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	withWPPlanTabs: PropTypes.bool,
	plansWithScroll: PropTypes.bool,
	planTypes: PropTypes.array,
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	intervalType: 'yearly',
	isChatAvailable: false,
	showFAQ: true,
	siteId: null,
	siteSlug: '',
	withWPPlanTabs: false,
	plansWithScroll: false,
};

export default connect(
	( state, props ) => {
		const siteId = get( props.site, [ 'ID' ] );
		const currentPlan = getSitePlan( state, siteId );

		const siteType = props.isInSignup
			? getSignupSiteType( state )
			: getSiteTypePropertyValue( 'id', getSiteOption( state, siteId, 'site_segment' ), 'slug' );

		const customerType = chooseDefaultCustomerType( {
			currentCustomerType: props.customerType,
			selectedPlan: props.selectedPlan,
			currentPlan,
			siteType,
			abtest,
		} );

		return {
			// This is essentially a hack - discounts are the only endpoint that we can rely on both on /plans and
			// during the signup, and we're going to remove the code soon after the test. Also, since this endpoint is
			// pretty versatile, we could rename it from discounts to flags/features/anything else and make it more
			// universal.
			withWPPlanTabs: isDiscountActive( getDiscountByName( 'new_plans' ), state ),
			plansWithScroll: ! props.displayJetpackPlans && props.plansWithScroll,
			customerType,
			domains: getDecoratedSiteDomains( state, siteId ),
			isChatAvailable: isHappychatAvailable( state ),
			isJetpack: isJetpackSite( state, siteId ),
			siteId,
			siteSlug: getSiteSlug( state, get( props.site, [ 'ID' ] ) ),
			sitePlanSlug: currentPlan && currentPlan.product_slug,
			siteType,
		};
	},
	{
		selectHappychatSiteId,
	}
)( localize( PlansFeaturesMain ) );
