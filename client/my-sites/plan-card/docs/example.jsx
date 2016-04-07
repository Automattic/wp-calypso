/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanCard from '../index';
import PlanCardItem from '../item';

export default React.createClass( {

	displayName: 'PlanCardExample',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/plan-card-example">Plan Card</a>
				</h2>
				<div>
					<PlanCard
						title="Free Plan"
						line="Free for life"
						buttonName="Your Plan"
						currentPlan={ true }>
						<PlanCardItem highlight={ true }>
							3GB Space
						</PlanCardItem>
						<PlanCardItem unavailable={ true }>
							Custom Domain
						</PlanCardItem>
						<PlanCardItem unavailable={ true }>
							No Ads
						</PlanCardItem>
						<PlanCardItem unavailable={ true }>
							Custom Design
						</PlanCardItem>
						<PlanCardItem unavailable={ true }>
							VideoPress
						</PlanCardItem>
					</PlanCard>
				</div>
				<br />
				<div>
					<PlanCard
						title="Premium"
						line="$99 per year"
						buttonName="Upgrade"
						currentPlan={ false }
						popularRibbon={ true }>
						<PlanCardItem highlight={ true }>
							13GB Space
						</PlanCardItem>
						<PlanCardItem>
							Custom Domain
						</PlanCardItem>
						<PlanCardItem>
							No Ads
						</PlanCardItem>
						<PlanCardItem>
							Custom Design
						</PlanCardItem>
						<PlanCardItem>
							VideoPress
						</PlanCardItem>
					</PlanCard>
				</div>
			</div>
		);
	}
} );
