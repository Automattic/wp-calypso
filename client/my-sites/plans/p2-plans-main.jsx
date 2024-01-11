import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import PlansFeaturesMain from '../plans-features-main';

export class P2PlansMain extends Component {
	render() {
		const { siteId } = this.props;

		return (
			<>
				<QueryPlans />
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />
				<PlansFeaturesMain
					siteId={ siteId }
					intervalType={ [ 'monthly' ] }
					hidePlansFeatureComparison={ true }
					hidePlanTypeSelector={ true }
					intent="plans-p2"
					isInSignup={ false }
					showPlanTypeSelectorDropdown={
						/**
						 *	Override the default feature flag to prevent this feature from rendering in untested locations
						 *  The hardcoded 'false' short curicuit should be removed once the feature is fully tested in the given context
						 */
						config.isEnabled( 'onboarding/interval-dropdown' ) && false
					}
				/>
			</>
		);
	}
}

export default connect( ( state, props ) => ( {
	siteId: props.site?.ID,
} ) )( localize( P2PlansMain ) );
