/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PlanCompareCard from '../index';
import PlanCompareCardItem from '../item';

export default class extends React.PureComponent {
	static displayName = 'PlanCompareCard';

	render() {
		return (
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
		);
	}
}
