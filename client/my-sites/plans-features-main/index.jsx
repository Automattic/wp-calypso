/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';
import _ from 'lodash';

/**
 * Internal dependencies
 */
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
import { plansLink, planMatches, findPlansKeys, getPlan } from 'lib/plans';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import PaymentMethods from 'blocks/payment-methods';
import HappychatConnection from 'components/happychat/connection-connected';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import { getSitePlan, getSiteSlug } from 'state/sites/selectors';
import { isDiscountActive } from 'state/selectors/get-active-discount.js';
import { getDiscountByName } from 'lib/discounts';
import { selectSiteId as selectHappychatSiteId } from 'state/help/actions';
import { abtest } from 'lib/abtest';

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
			isLandingPage,
			isLaunchPage,
			onUpgradeClick,
			plansWithScroll,
			selectedFeature,
			selectedPlan,
			withDiscount,
			siteId,
		} = this.props;

		const plans = this.getPlansForPlanFeatures();
		const visiblePlans = this.getVisiblePlansForPlanFeatures( plans );
		const popular = customerType === 'personal' || plansWithScroll ? TYPE_PREMIUM : TYPE_BUSINESS;
		return (
			<div
				className={ classNames(
					'plans-features-main__group',
					'is-' + ( displayJetpackPlans ? 'jetpack' : 'wpcom' ),
					{
						[ `is-customer-${ customerType }` ]: ! displayJetpackPlans,
					}
				) }
				data-e2e-plans={ displayJetpackPlans ? 'jetpack' : 'wpcom' }
			>
				<PlanFeatures
					basePlansPath={ basePlansPath }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					displayJetpackPlans={ displayJetpackPlans }
					domainName={ domainName }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					isLaunchPage={ isLaunchPage }
					plansWithScroll={ plansWithScroll }
					onUpgradeClick={ onUpgradeClick }
					plans={ plans }
					visiblePlans={ visiblePlans }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					popularPlanSpec={ {
						type: popular,
						group: GROUP_WPCOM,
					} }
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
			countryCode,
			plansWithScroll,
		} = this.props;

		const currentPlan = getPlan( selectedPlan );

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

		if (
			countryCode &&
			displayJetpackPlans &&
			abtest( 'jetpackMonthlyPlansOnly', countryCode ) === 'monthlyOnly'
		) {
			term = TERM_MONTHLY;
		}

		// In WPCOM, only the business plan is available in monthly term
		// For any other plan, switch to annually.
		const businessPlanTerm = term;
		if ( group === GROUP_WPCOM && term === TERM_MONTHLY ) {
			term = TERM_ANNUALLY;
		}

		let plans;
		if ( group === GROUP_JETPACK ) {
			plans = [
				findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_BUSINESS } )[ 0 ],
			];
		} else {
			plans = [
				findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_BLOGGER } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
				findPlansKeys( { group, term: businessPlanTerm, type: TYPE_BUSINESS } )[ 0 ],
				findPlansKeys( { group, term, type: TYPE_ECOMMERCE } )[ 0 ],
			];
		}

		if ( hideFreePlan || plansWithScroll ) {
			plans.shift();
		}

		if ( ! isEnabled( 'plans/personal-plan' ) && ! displayJetpackPlans ) {
			plans.splice( plans.indexOf( plans.filter( p => p.type === TYPE_PERSONAL )[ 0 ] ), 1 );
		}

		return plans;
	}

	getVisiblePlansForPlanFeatures( plans ) {
		const { displayJetpackPlans, customerType, plansWithScroll, newPlansVisible } = this.props;

		const isPlanOneOfType = ( plan, types ) =>
			types.filter( type => planMatches( plan, { type } ) ).length > 0;

		if ( displayJetpackPlans || plansWithScroll ) {
			return plans;
		}

		if ( ! newPlansVisible ) {
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
			<SegmentedControl compact className={ segmentClasses } primary={ true }>
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

	renderToggle() {
		const { displayJetpackPlans, withWPPlanTabs, newPlansVisible, plansWithScroll } = this.props;
		if ( displayJetpackPlans ) {
			if ( countryCode && abtest( 'jetpackMonthlyPlansOnly', countryCode ) === 'monthlyOnly' ) {
				return false;
			}
			return this.getIntervalTypeToggle();
		}
		if ( newPlansVisible && ! plansWithScroll ) {
			return this.getCustomerTypeToggle();
		}
		return false;
	}

	render() {
		const { displayJetpackPlans, isInSignup, plansWithScroll, siteId } = this.props;
		let faqs = null;

		if ( ! isInSignup ) {
			faqs = displayJetpackPlans ? <JetpackFAQ /> : <WpcomFAQ />;
		}

		return (
			<div className={ classNames( 'plans-features-main', { 'is-no-tabs': plansWithScroll } ) }>
				<HappychatConnection />
				<div className="plans-features-main__notice" />
				{ this.renderToggle() }
				<QueryPlans />
				<QuerySitePlans siteId={ siteId } />
				{ plansWithScroll ? (
					<Scroller
						elementSelector=".plan-features__table tbody > tr:first-child > .plan-features__table-item"
						setElementActive={ this.setElementActive }
						getRightGutterSizeForElement={ this.getRightGutterSizeForElement }
					>
						{ this.getPlanFeatures() }
					</Scroller>
				) : null }
				{ ! plansWithScroll ? this.getPlanFeatures() : null }
				<CartData>
					<PaymentMethods />
				</CartData>
				{ faqs }
			</div>
		);
	}

	setElementActive = ( index, isActive ) => {
		const currentNode = ReactDOM.findDOMNode( this );
		const rows = currentNode.querySelectorAll( '.plan-features__table tbody > tr' );
		for ( let i = 0, max = rows.length; i < max; i++ ) {
			const row = rows[ i ];
			const cols = row.querySelectorAll( '.plan-features__table-item' );
			const col = cols[ index ];
			if ( isActive ) {
				col.classList.add( 'is-active' );
				col.classList.remove( 'is-inactive' );
			} else {
				col.classList.remove( 'is-active' );
				col.classList.add( 'is-inactive' );
			}
		}
	};

	getRightGutterSizeForElement = index => {
		const currentNode = ReactDOM.findDOMNode( this );
		const spacer = currentNode.querySelector(
			'.plan-features__table tbody > tr:first-child .plan-features__table-space'
		);
		return spacer.offsetWidth;
	};
}

PlansFeaturesMain.propTypes = {
	basePlansPath: PropTypes.string,
	displayJetpackPlans: PropTypes.bool.isRequired,
	hideFreePlan: PropTypes.bool,
	customerType: PropTypes.string,
	intervalType: PropTypes.string,
	isChatAvailable: PropTypes.bool,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	plansWithScroll: PropTypes.bool,
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	showFAQ: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	newPlansVisible: PropTypes.bool,
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	intervalType: 'yearly',
	isChatAvailable: false,
	plansWithScroll: false,
	showFAQ: true,
	siteId: null,
	siteSlug: '',
	newPlansVisible: false,
};

const guessCustomerType = ( state, props ) => {
	if ( props.customerType ) {
		return props.customerType;
	}

	const site = props.site;
	const currentPlan = getSitePlan( state, get( site, [ 'ID' ] ) );
	if ( currentPlan ) {
		const group = GROUP_WPCOM;
		const businessPlanSlugs = [
			findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_PREMIUM } )[ 0 ],
			findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_PREMIUM } )[ 0 ],
			findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_BUSINESS } )[ 0 ],
			findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_BUSINESS } )[ 0 ],
			findPlansKeys( { group, term: TERM_ANNUALLY, type: TYPE_ECOMMERCE } )[ 0 ],
			findPlansKeys( { group, term: TERM_BIENNIALLY, type: TYPE_ECOMMERCE } )[ 0 ],
		]
			.map( planKey => getPlan( planKey ) )
			.map( plan => plan.getStoreSlug() );
		const isPlanInBusinessGroup = businessPlanSlugs.indexOf( currentPlan.product_slug ) !== -1;
		return isPlanInBusinessGroup ? 'business' : 'personal';
	}

	return 'personal';
};

export default connect(
	( state, props ) => {
		return {
			// This is essentially a hack - discounts are the only endpoint that we can rely on both on /plans and
			// during the signup, and we're going to remove the code soon after the test. Also, since this endpoint is
			// pretty versatile, we could rename it from discounts to flags/features/anything else and make it more
			// universal.
			newPlansVisible: isDiscountActive( getDiscountByName( 'new_plans' ), state ),
			plansWithScroll: 1 || isDiscountActive( getDiscountByName( 'plans_no_tabs' ), state ),
			customerType: guessCustomerType( state, props ),
			isChatAvailable: isHappychatAvailable( state ),
			siteId: get( props.site, [ 'ID' ] ),
			siteSlug: getSiteSlug( state, get( props.site, [ 'ID' ] ) ),
		};
	},
	{
		selectHappychatSiteId,
	}
)( localize( PlansFeaturesMain ) );
