/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPlans } from 'state/plans/selectors';
import { getPlansBySite } from 'state/sites/plans/selectors';
import QueryPlans from 'components/data/query-plans';
import PlanList from 'components/plans/plan-list' ;
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';

const Plans = ( { translate, domain, sites, plans, sitePlans, onGoBack } ) => {
	const site = sites.getSelectedSite();
	const comparePlansUrl = '/domains/add/' + domain + '/plans/compare/' + site.slug;

	return (
		<div className="plans has-sidebar">
			<HeaderCake onClick={ onGoBack }>
				{ translate( 'Register %(domain)s', { args: { domain } } ) }
			</HeaderCake>

			<QueryPlans />

			<PlanList { ...{
				site,
				plans,
				sitePlans,
				comparePlansUrl,
				hideFreePlan: true,
				isInSignup: true
			} } />
			<a href={ comparePlansUrl } className="plans-step__compare-plans-link">
				<Gridicon icon="clipboard" size={ 18 } />
				{ translate( 'Compare Plans' ) }
			</a>
		</div>
	);
};

Plans.propTypes = {
	translate: React.PropTypes.func.isRequired,
	domain: React.PropTypes.string.isRequired,
	sites: React.PropTypes.object.isRequired,
	plans: React.PropTypes.array.isRequired,
	sitePlans: React.PropTypes.object.isRequired
};

export default connect(
	( state, props ) => ( {
		plans: getPlans( state ),
		sitePlans: getPlansBySite( state, props.sites.getSelectedSite )
	} )
)( localize( Plans ) );
