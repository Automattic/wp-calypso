/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import { getPlans } from 'state/plans/selectors';
import { getPlansBySite } from 'state/sites/plans/selectors';
import QueryPlans from 'components/data/query-plans';
import PlansCompare from 'components/plans/plans-compare' ;

const UpgradePlansCompare = ( { domain, sites, plans, features, productsList } ) => {
	const selectedSite = sites.getSelectedSite();
	const backUrl = '/domains/add/' + domain + '/plans/' + selectedSite.slug;

	return (
		<div className="plans has-sidebar">
			<QueryPlans />

			<PlansCompare { ...{
				selectedSite,
				plans,
				features,
				productsList,
				backUrl,
				hideFreePlan: true,
				isInSignup: true
			} } />
		</div>
	);
};

UpgradePlansCompare.propTypes = {
	domain: React.PropTypes.string.isRequired,
	sites: React.PropTypes.object.isRequired,
	plans: React.PropTypes.array.isRequired,
	features: React.PropTypes.object.isRequired,
	productsList: React.PropTypes.object.isRequired
};

export default connect(
	( state, props ) => ( {
		plans: getPlans( state ),
		sitePlans: getPlansBySite( state, props.sites.getSelectedSite )
	} )
)( UpgradePlansCompare );
