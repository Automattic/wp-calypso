import { getIntervalTypeForTerm } from '@automattic/calypso-products';
import { connect } from 'react-redux';
import Plans from 'calypso/my-sites/plans/main';
import getCurrentPlanTerm from 'calypso/state/selectors/get-current-plan-term';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default connect( ( state, { intervalType } ) => {
	// For WP.com plans page, if intervalType is not explicitly specified in the URL,
	// we want to show plans of the same term as plan that is currently active
	if ( ! intervalType ) {
		const selectedSiteId = getSelectedSiteId( state );
		intervalType = getIntervalTypeForTerm( getCurrentPlanTerm( state, selectedSiteId ) );
	}

	return {
		intervalType,
	};
} )( Plans );
