/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanFeatures from 'calypso/my-sites/plan-features';
import { PLAN_P2_PLUS } from 'calypso/lib/plans/constants';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySites from 'calypso/components/data/query-sites';
import QuerySitePlans from 'calypso/components/data/query-site-plans';

export class P2PlansMain extends Component {
	render() {
		const { selectedFeature, selectedPlan, redirectTo, siteId } = this.props;

		return (
			<>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<PlanFeatures
					plans={ [ PLAN_P2_PLUS ] }
					redirectTo={ redirectTo }
					visiblePlans={ [ PLAN_P2_PLUS ] }
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					siteId={ siteId }
					isInSignup={ false }
					nonDotBlogDomains={ [] }
				/>
			</>
		);
	}
}

export default connect( ( state, props ) => {
	const siteId = get( props.site, [ 'ID' ] );

	return {
		siteId,
	};
} )( localize( P2PlansMain ) );
