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
import PlanFeatures from 'my-sites/plan-features';
import {
	TYPE_FREE,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
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
import { plansLink, findPlansKeys, getPlan } from 'lib/plans';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import PaymentMethods from 'blocks/payment-methods';
import HappychatConnection from 'components/happychat/connection-connected';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import { getSitePlan, getSiteSlug } from 'state/sites/selectors';
import { selectSiteId as selectHappychatSiteId } from 'state/help/actions';

const getOldStylePlans = ( group, term ) => [
	findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_BUSINESS } )[ 0 ],
];

const getPersonalPlans = ( group, term ) => [
	findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_BLOGGER } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_PERSONAL } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
];

const getBusinessPlans = ( group, term ) => [
	findPlansKeys( { group, type: TYPE_FREE } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_PREMIUM } )[ 0 ],
	findPlansKeys( { group, term, type: TYPE_BUSINESS } )[ 0 ],
];

const getWPComBusinessPlanSlugs = () =>
	[]
		.concat( getBusinessPlans( GROUP_WPCOM, TERM_ANNUALLY ) )
		.concat( getBusinessPlans( GROUP_WPCOM, TERM_BIENNIALLY ) )
		.map( planKey => getPlan( planKey ) )
		.map( plan => plan.getStoreSlug() );

export class PlansFeaturesMain extends Component {
	componentWillUpdate( nextProps ) {
		/**
		 * Happychat does not update with the selected site right now :(
		 * This ensures that Happychat groups are correct in case we switch sites while on the plans
		 * page, for example between a Jetpack and Simple site.
		 *
		 * @TODO: When happychat correctly handles site switching, remove selectHappychatSiteId action.
		 */
		const { siteId } = this.props;
		const { siteId: nextSiteId } = nextProps;
		if ( siteId !== nextSiteId && nextSiteId ) {
			this.props.selectHappychatSiteId( nextSiteId );
		}
	}

	getPlanFeatures() {
		const {
			basePlansPath,
			displayJetpackPlans,
			domainName,
			isInSignup,
			isLandingPage,
			onUpgradeClick,
			selectedFeature,
			selectedPlan,
			withDiscount,
			siteId,
		} = this.props;

		return (
			<div
				className="plans-features-main__group"
				data-e2e-plans={ displayJetpackPlans ? 'jetpack' : 'wpcom' }
			>
				<PlanFeatures
					basePlansPath={ basePlansPath }
					displayJetpackPlans={ displayJetpackPlans }
					domainName={ domainName }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					onUpgradeClick={ onUpgradeClick }
					plans={ this.getPlansForPlanFeatures() }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					siteId={ siteId }
				/>
			</div>
		);
	}

	getPlansForPlanFeatures() {
		const {
			displayJetpackPlans,
			customerType,
			intervalType,
			selectedPlan,
			hideFreePlan,
			withWPPlanTabs,
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
		let plans;
		if ( withWPPlanTabs ) {
			if ( customerType === 'personal' ) {
				plans = getPersonalPlans( group, term );
			} else {
				plans = getBusinessPlans( group, term );
			}
		} else {
			plans = getOldStylePlans( group, term );
		}

		if ( hideFreePlan ) {
			plans.shift();
		}

		if ( ! isEnabled( 'plans/personal-plan' ) && ! displayJetpackPlans ) {
			plans.splice( plans.indexOf( plans.filter( p => p.type === TYPE_PERSONAL )[ 0 ] ), 1 );
		}

		return plans;
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
					{ translate( 'Online Stores and Business Sites' ) }
				</SegmentedControlItem>
			</SegmentedControl>
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
		const { displayJetpackPlans, isInSignup, siteId } = this.props;
		let faqs = null;

		if ( ! isInSignup ) {
			faqs = displayJetpackPlans ? <JetpackFAQ /> : <WpcomFAQ />;
		}

		return (
			<div className="plans-features-main">
				<HappychatConnection />
				<div className="plans-features-main__notice" />
				{ this.renderToggle() }
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
	selectedFeature: PropTypes.string,
	selectedPlan: PropTypes.string,
	showFAQ: PropTypes.bool,
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	withWPPlanTabs: PropTypes.bool,
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
};

const guessCustomerType = ( state, props ) => {
	const site = props.site;
	let customerType = props.customerType;
	if ( ! customerType ) {
		const currentPlan = getSitePlan( state, get( site, [ 'ID' ] ) );
		if ( currentPlan ) {
			const isPlanInBusinessGroup =
				getWPComBusinessPlanSlugs().indexOf( currentPlan.product_slug ) !== -1;
			customerType = isPlanInBusinessGroup ? 'business' : 'personal';
		}
	}
	if ( ! customerType ) {
		customerType = 'personal';
	}
	return customerType;
};

export default connect(
	( state, props ) => {
		return {
			withWPPlanTabs: true,
			customerType: guessCustomerType( state, props ),
			isChatAvailable: isHappychatAvailable( state ),
			siteId: get( props.site, [ 'ID' ] ),
			siteSlug: getSiteSlug( state, get( props.site, [ 'ID' ] ) ),
		};
	},
	{ selectHappychatSiteId }
)( localize( PlansFeaturesMain ) );
