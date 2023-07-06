import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';

export class P2PlansMain extends Component {
	render() {
		const {
			selectedFeature,
			selectedPlan,
			redirectTo,
			siteId,
			site,
			withDiscount,
			discountEndDate,
		} = this.props;

		return (
			<>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<PlansFeaturesMain
					// redirectToAddDomainFlow={ this.props.redirectToAddDomainFlow }
					hidePlanTypeSelector={ true }
					hidePremiumPlan={ true }
					hideEcommercePlan={ true }
					// customerType={ this.props.customerType }
					intervalType="monthly"
					selectedFeature={ selectedFeature }
					selectedPlan={ selectedPlan }
					redirectTo={ redirectTo }
					withDiscount={ withDiscount }
					discountEndDate={ discountEndDate }
					site={ site }
					// intent="plans-p2"
					// plansWithScroll={ false }
					hidePlansFeatureComparison={ true }
					// planTypes={ planTypes }
				/>
			</>
		);
	}
}

export default connect( ( state, props ) => ( {
	siteId: props.site?.ID,
} ) )( localize( P2PlansMain ) );
