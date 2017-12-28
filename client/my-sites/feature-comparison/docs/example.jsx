/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import FeatureComparison from '../index';
import PlanCompareCard from 'client/my-sites/plan-compare-card/index';
import PlanCompareCardItem from 'client/my-sites/plan-compare-card/item';

export default class extends React.PureComponent {
	static displayName = 'FeatureComparison';

	render() {
		return (
			<FeatureComparison>
				<PlanCompareCard
					title="Free Plan"
					line="Free for life"
					buttonName="Your Plan"
					currentPlan={ true }
				>
					<PlanCompareCardItem highlight={ true }>3GB Space</PlanCompareCardItem>
					<PlanCompareCardItem unavailable={ true }>Custom Domain</PlanCompareCardItem>
					<PlanCompareCardItem unavailable={ true }>No Ads</PlanCompareCardItem>
					<PlanCompareCardItem unavailable={ true }>Custom Design</PlanCompareCardItem>
					<PlanCompareCardItem unavailable={ true }>VideoPress</PlanCompareCardItem>
				</PlanCompareCard>
				<PlanCompareCard
					title="Premium"
					line="$99 per year"
					buttonName="Upgrade"
					currentPlan={ false }
					popularRibbon={ true }
				>
					<PlanCompareCardItem highlight={ true }>13GB Space</PlanCompareCardItem>
					<PlanCompareCardItem>Custom Domain</PlanCompareCardItem>
					<PlanCompareCardItem>No Ads</PlanCompareCardItem>
					<PlanCompareCardItem>Custom Design</PlanCompareCardItem>
					<PlanCompareCardItem>VideoPress</PlanCompareCardItem>
				</PlanCompareCard>
			</FeatureComparison>
		);
	}
}
