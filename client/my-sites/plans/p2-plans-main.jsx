import { PLAN_P2_FREE, PLAN_P2_PLUS } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import PlanFeatures from 'calypso/my-sites/plan-features';

export class P2PlansMain extends Component {
	render() {
		const { selectedFeature, selectedPlan, redirectTo, siteId } = this.props;

		return (
			<>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<PlanFeatures
					plans={ [ PLAN_P2_FREE, PLAN_P2_PLUS ] }
					redirectTo={ redirectTo }
					visiblePlans={ [ PLAN_P2_FREE, PLAN_P2_PLUS ] }
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

export default connect( ( state, props ) => ( {
	siteId: props.site?.ID,
} ) )( localize( P2PlansMain ) );
