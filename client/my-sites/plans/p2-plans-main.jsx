import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import PlansFeaturesMain from '../plans-features-main';

export class P2PlansMain extends Component {
	render() {
		const { siteId } = this.props;

		return (
			<>
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<PlansFeaturesMain
					siteId={ siteId }
					intervalType={ [ 'monthly' ] }
					hidePlansFeatureComparison
					hidePlanTypeSelector
					intent="plans-p2"
					isInSignup={ false }
				/>
			</>
		);
	}
}

export default connect( ( state, props ) => ( {
	siteId: props.site?.ID,
} ) )( localize( P2PlansMain ) );
