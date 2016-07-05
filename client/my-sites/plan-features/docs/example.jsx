/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import PlanFeatures from '../';
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
import QueryPlans from 'components/data/query-plans';

export default React.createClass( {

	displayName: 'PlanFeatures',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/plan-features">Plan Features</a>

				</h2>
				<QueryPlans />
				<div style={ { display: 'flex' } } >
					<PlanFeatures plan={ PLAN_FREE } />
					<PlanFeatures plan={ PLAN_PERSONAL } />
					<PlanFeatures plan={ PLAN_PREMIUM } />
					<PlanFeatures plan={ PLAN_BUSINESS } />
				</div>
				<div style={ { display: 'flex' } }>
					<PlanFeatures plan={ PLAN_JETPACK_BUSINESS } />
					<PlanFeatures plan={ PLAN_JETPACK_BUSINESS_MONTHLY } />
					<PlanFeatures plan={ PLAN_JETPACK_PREMIUM } />
					<PlanFeatures plan={ PLAN_JETPACK_PREMIUM_MONTHLY } />
				</div>
			</div>
		);
	}
} );
