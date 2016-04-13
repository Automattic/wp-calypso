/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanCompareCard from '../index';
import PlanCompareCardItem from '../item';

export default React.createClass( {

	displayName: 'PlanCompareCard',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/plan-compare-card">Plan Compare Card</a>
				</h2>
				<div>
					<PlanCompareCard
						title="Free Plan"
						line="Free for life"
						buttonName="Your Plan"
						currentPlan={ true }>
						<PlanCompareCardItem highlight={ true }>
							3GB Space
						</PlanCompareCardItem>
						<PlanCompareCardItem unavailable={ true }>
							Custom Domain
						</PlanCompareCardItem>
						<PlanCompareCardItem unavailable={ true }>
							No Ads
						</PlanCompareCardItem>
						<PlanCompareCardItem unavailable={ true }>
							Custom Design
						</PlanCompareCardItem>
						<PlanCompareCardItem unavailable={ true }>
							VideoPress
						</PlanCompareCardItem>
					</PlanCompareCard>
				</div>
				<br />
				<div>
					<PlanCompareCard
						title="Premium"
						line="$99 per year"
						buttonName="Upgrade"
						currentPlan={ false }
						popularRibbon={ true }>
						<PlanCompareCardItem highlight={ true }>
							13GB Space
						</PlanCompareCardItem>
						<PlanCompareCardItem>
							Custom Domain
						</PlanCompareCardItem>
						<PlanCompareCardItem>
							No Ads
						</PlanCompareCardItem>
						<PlanCompareCardItem>
							Custom Design
						</PlanCompareCardItem>
						<PlanCompareCardItem>
							VideoPress
						</PlanCompareCardItem>
					</PlanCompareCard>
				</div>
			</div>
		);
	}
} );
