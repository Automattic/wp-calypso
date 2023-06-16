import {
	findPlansKeys,
	getPlan,
	getPopularPlanSpec,
	isFreePlan,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TERM_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
	GROUP_WPCOM,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import PlanFeatures from 'calypso/my-sites/plan-features';
import PlanFeaturesComparison from 'calypso/my-sites/plan-features-comparison';
import PlanFAQ from 'calypso/my-sites/plans-features-main/components/plan-faq';
import PlanTypeSelector from 'calypso/my-sites/plans-features-main/components/plan-type-selector';

import 'calypso/my-sites/plans-features-main/style.scss';

export class PlansFeaturesMainPM extends Component {
	showPricingGrid() {
		const {
			customerType,
			discountEndDate,
			domainName,
			flowName,
			isInSignup,
			onUpgradeClick,
			plansWithScroll,
			selectedPlan,
			shouldShowPlansFeatureComparison,
			withDiscount,
		} = this.props;

		const plans = this.getPlans();

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
						discountEndDate={ discountEndDate }
						domainName={ domainName }
						flowName={ flowName }
						isInSignup={ isInSignup }
						isReskinned={ true }
						onUpgradeClick={ onUpgradeClick }
						plans={ plans }
						popularPlanSpec={ getPopularPlanSpec( {
							flowName,
							customerType,
							availablePlans: plans,
						} ) }
						visiblePlans={ plans }
						withDiscount={ withDiscount }
						withScroll={ plansWithScroll }
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
				{ this.renderSecondaryFormattedHeader() }
				<PlanFeatures
					domainName={ domainName }
					discountEndDate={ discountEndDate }
					flowName={ flowName }
					isInSignup={ isInSignup }
					isInVerticalScrollingPlansExperiment={ true }
					kindOfPlanTypeSelector={ this.props.planTypeSelector }
					nonDotBlogDomains={ [] }
					onUpgradeClick={ onUpgradeClick }
					plans={ plans }
					popularPlanSpec={ getPopularPlanSpec( {
						flowName,
						customerType,
						availablePlans: plans,
					} ) }
					selectedPlan={ selectedPlan }
					withDiscount={ withDiscount }
					withScroll={ plansWithScroll }
				/>
			</div>
		);
	}
	renderSecondaryFormattedHeader() {
		let headerText;
		let subHeaderText;

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

	getPlanBillingPeriod( intervalType, defaultValue = null ) {
		const plans = {
			monthly: TERM_MONTHLY,
			yearly: TERM_ANNUALLY,
			'2yearly': TERM_BIENNIALLY,
			'3yearly': TERM_TRIENNIALLY,
		};

		return plans[ intervalType ] || defaultValue || TERM_ANNUALLY;
	}

	getPlans() {
		const { intervalType, selectedPlan, hideFreePlan } = this.props;

		const term = this.getPlanBillingPeriod( intervalType, getPlan( selectedPlan )?.term );
		let plans = [
			findPlansKeys( { group: GROUP_WPCOM, type: TYPE_FREE } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PERSONAL } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_PREMIUM } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_BUSINESS } )[ 0 ],
			findPlansKeys( { group: GROUP_WPCOM, term, type: TYPE_ECOMMERCE } )[ 0 ],
		].filter( ( el ) => el );

		if ( hideFreePlan ) {
			plans = plans.filter( ( planSlug ) => ! isFreePlan( planSlug ) );
		}
		return plans;
	}

	getPlanTypeSelector() {
		const planTypeSelector = {
			basePlansPath: this.props.basePlansPath,
			customerType: 'personal',
			eligibleForWpcomMonthlyPlans: true,
			isInSignup: this.props.isInSignup,
			intervalType: this.props.intervalType,
			showBiannualToggle: this.props.showBiannualToggle,
		};
		const plans = this.getPlans();

		return <PlanTypeSelector { ...planTypeSelector } kind="interval" plans={ plans } />;
	}

	render() {
		return (
			<div className={ classNames( 'plans-features-main' ) }>
				<div className="plans-features-main__notice" />
				{ this.getPlanTypeSelector() }
				{ this.showPricingGrid() }
				<PlanFAQ />
			</div>
		);
	}
}

PlansFeaturesMainPM.propTypes = {
	basePlansPath: PropTypes.string,
	customerType: PropTypes.string,
	flowName: PropTypes.string,
	hideFreePlan: PropTypes.bool,
	intervalType: PropTypes.oneOf( [ 'monthly', 'yearly', '2yearly' ] ),
	isInSignup: PropTypes.bool,
	isReskinned: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	plansWithScroll: PropTypes.bool,
	planTypeSelector: PropTypes.string,
	redirectToAddDomainFlow: PropTypes.bool,
	showBiannualToggle: PropTypes.bool,
	shouldShowPlansFeatureComparison: PropTypes.bool,
};

PlansFeaturesMainPM.defaultProps = {
	basePlansPath: null,
	hideFreePlan: false,
	intervalType: 'yearly',
	isInSignup: true,
	isReskinned: true,
	plansWithScroll: false,
	planTypeSelector: 'interval',
	showBiannualToggle: true,
	shouldShowPlansFeatureComparison: true,
};

export default PlansFeaturesMainPM;
