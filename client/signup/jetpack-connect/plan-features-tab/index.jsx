/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanFeatures from 'my-sites/plan-features';
import SegmentedControl from 'components/segmented-control';
import SegmentedControlItem from 'components/segmented-control/item';
import {
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from 'lib/plans/constants';
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';

const jetpackPlansPersonalTab = [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL ];
const jetpackPlansPremiumTab = [ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_BUSINESS ];
const jetpackMonthlyPlansPersonalTab = [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL_MONTHLY ];
const jetpackMonthlyPlansPremiumTab = [ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS_MONTHLY ];
const TAB_PERSONAL = 'personal';
const TAB_BUSINESS = 'business';

class PlansFeaturesMain extends Component {

	state = { currentTab: TAB_PERSONAL }

	changePlanGroup = () => {
		this.setState( {
			currentTab: this.state.currentTab === TAB_PERSONAL
				? TAB_BUSINESS
				: TAB_PERSONAL
		} );
	}

	renderPlanTypeSelector() {
		const { translate } = this.props;
		const { currentTab } = this.state;

		return (
			<div>
				<SegmentedControl primary className="plan-features-tab__selector">
					<SegmentedControlItem
						selected={ currentTab === TAB_PERSONAL }
						onClick={ this.changePlanGroup }>
							{ translate( 'Personal' ) }
					</SegmentedControlItem>
					<SegmentedControlItem
						selected={ currentTab === TAB_BUSINESS }
						onClick={ this.changePlanGroup }>
							{ translate( 'Business' ) }
					</SegmentedControlItem>
				</SegmentedControl>
			</div>
		);
	}

	getCurrentViewablePlans() {
		let plans;
		if ( this.props.intervalType === 'monthly' ) {
			plans = this.state.currentTab === TAB_PERSONAL
				? jetpackMonthlyPlansPersonalTab
				: jetpackMonthlyPlansPremiumTab;
		} else {
			plans = this.state.currentTab === TAB_PERSONAL
				? jetpackPlansPersonalTab
				: jetpackPlansPremiumTab;
		}

		if ( this.props.hideFreePlan && this.state.currentTab === TAB_PERSONAL ) {
			plans = Object.assign( [], plans );
			plans.shift();
		}
		return plans;
	}

	getPlanFeatures() {
		const {
			site,
			intervalType,
			onUpgradeClick,
			isInSignup,
			isLandingPage,
			basePlansPath,
			selectedFeature
		} = this.props;

		return (
			<div className="plans-features-main__group">
				<PlanFeatures
					plans={ this.getCurrentViewablePlans() }
					selectedFeature={ selectedFeature }
					onUpgradeClick={ onUpgradeClick }
					isInSignup={ isInSignup }
					isLandingPage={ isLandingPage }
					basePlansPath={ basePlansPath }
					intervalType={ intervalType }
					site={ site }
				/>
			</div>
		);
	}

	getJetpackFAQ() {
		const { translate } = this.props;

		return (
			<FAQ>
				<FAQItem
					question={ translate( 'I signed up and paid. What’s next?' ) }
					answer={ translate(
						'Our premium features are powered by a few of our other plugins. After purchasing you will' +
						' need to install the Akismet and VaultPress plugins. If you purchase a Professional' +
						' subscription, you will also need to install the Polldaddy plugin. Just follow the guide' +
						' after you complete your purchase.'
					) }
				/>

				<FAQItem
					question={ translate( 'What are the hosting requirements?' ) }
					answer={ translate(
						'You should be running the latest version of WordPress and be using a web host that runs' +
						' PHP 5 or higher. You will also need a WordPress.com account (you can register' +
						' during the connection process) and a publicly-accessible site with XML-RPC enabled.'
					) }
				/>

				<FAQItem
					question={ translate( 'Does this work with a multisite network?' ) }
					answer={ translate(
						'Yes, Jetpack and all of its premium features are compatible with WordPress Multisite' +
						' networks. If you manage a Multisite network you will need to make sure you have a' +
						' subscription for each site you wish to cover with premium features.'
					) }
				/>

				<FAQItem
					question={ translate( 'Why do I need a WordPress.com account?' ) }
					answer={ translate(
						"Many of Jetpack's core features make use of the WordPress.com cloud. In order to make sure" +
						' everything works correctly, Jetpack requires you to connect a (free) WordPress.com' +
						" account. If you don't already have an account you can easily create one during the" +
						' connection process.'
					) }
				/>

				<FAQItem
					question={ translate( 'Can I migrate my subscription to a different site?' ) }
					answer={ translate(
						'Absolutely. You are always free to activate your premium services on a different' +
						' WordPress site.'
					) }
				/>

				<FAQItem
					question={ translate( 'What is the cancellation policy?' ) }
					answer={ translate(
						'You can request a cancellation within 30 days of purchase and receive a full refund.'
					) }
				/>

				<FAQItem
					question={ translate( 'Have more questions?' ) }
					answer={ translate(
						'No problem! Feel free to {{a}}get in touch{{/a}} with our Happiness Engineers.',
						{
							components: { a: <a href="https://jetpack.com/contact-support/" target="_blank" rel="noopener noreferrer" /> }
						}
					) }
				/>
			</FAQ>

		);
	}

	render() {
		const { showFAQ } = this.props;
		return (
			<div className="plans-features-main plans-features-tab">
				{ this.renderPlanTypeSelector() }
				{ this.getPlanFeatures() }

				{
					showFAQ
						? this.getJetpackFAQ()
						: null
				}
			</div>
		);
	}
}

PlansFeaturesMain.PropTypes = {
	site: PropTypes.object,
	isInSignup: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	basePlansPath: PropTypes.string,
	intervalType: PropTypes.string,
	onUpgradeClick: PropTypes.func,
	hideFreePlan: PropTypes.bool,
	showFAQ: PropTypes.bool,
	selectedFeature: PropTypes.string
};

PlansFeaturesMain.defaultProps = {
	basePlansPath: null,
	intervalType: 'yearly',
	hideFreePlan: false,
	site: {},
	showFAQ: true
};

export default localize( PlansFeaturesMain );
