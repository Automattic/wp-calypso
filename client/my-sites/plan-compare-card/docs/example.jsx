import { PureComponent } from 'react';
import PlanCompareCard from '../index';
import PlanCompareCardItem from '../item';

export default class extends PureComponent {
	static displayName = 'PlanCompareCard';

	render() {
		return (
			<PlanCompareCard title="Free Plan" line="Free for life" buttonName="Your Plan" currentPlan>
				<PlanCompareCardItem highlight>3GB Space</PlanCompareCardItem>
				<PlanCompareCardItem unavailable>Custom Domain</PlanCompareCardItem>
				<PlanCompareCardItem unavailable>No Ads</PlanCompareCardItem>
				<PlanCompareCardItem unavailable>Custom Design</PlanCompareCardItem>
				<PlanCompareCardItem unavailable>VideoPress</PlanCompareCardItem>
			</PlanCompareCard>
		);
	}
}
