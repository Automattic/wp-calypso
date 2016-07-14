/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlanIcon from 'components/plans/plan-icon';
import {
	PLAN_FREE,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_PERSONAL
} from 'lib/plans/constants';

export default React.createClass( {
	displayName: 'PlanIcon',

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/faq">PlanIcon</a>
				</h2>
				
				<h3>Free/Jetpack Free Plan</h3>
				<PlanIcon plan={ PLAN_FREE } />
				
				<h3>Personal Plan</h3>
				<PlanIcon plan={ PLAN_PERSONAL } />
				
				<h3>Premium/Jetpack Premium Plan</h3>
				<PlanIcon plan={ PLAN_PREMIUM } />
				
				<h3>Business/Jetpack Business Plan</h3>
				<PlanIcon plan={ PLAN_BUSINESS } />
			</div>
		);
	}
} );

