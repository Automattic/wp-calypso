// import { PLAN_P2_FREE, PLAN_P2_PLUS } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import PlansFeaturesMain from '../plans-features-main';

export class P2PlansMain extends Component {
	render() {
		// const { selectedFeature, selectedPlan, redirectTo, siteId } = this.props;
		const { siteId } = this.props;

		return (
			<>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<PlansFeaturesMain
					siteId={ siteId }
					// hideFreePlan={ hideFreePlan }
					intervalType={ [ 'monthly' ] }
					// onUpgradeClick={ onSelectPlan }
					// paidDomainName={ getPaidDomainName() }
					// customerType={ customerType }
					// flowName={ flowName }
					// isReskinned={ isReskinned }
					hidePlansFeatureComparison={ true }
					hidePlanTypeSelector={ true }
					intent="plans-p2"
					isInSignup={ false }
					// removePaidDomain={ removePaidDomain }
					// setSiteUrlAsFreeDomainSuggestion={ setSiteUrlAsFreeDomainSuggestion }
				/>
			</>
		);
	}
}

export default connect( ( state, props ) => ( {
	siteId: props.site?.ID,
} ) )( localize( P2PlansMain ) );
