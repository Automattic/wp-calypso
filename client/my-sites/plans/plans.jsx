/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import config from 'config';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getIntervalTypeFromCurrentPlan } from 'state/plans/selectors';
import Plans from 'my-sites/plans/main';

export default connect( ( state, ownProps ) => {
	let intervalType = ownProps.intervalType;

	// For WP.com plans page, if intervalType is not explicitly specified in the URL,
	// we want to show plans of the same term as plan that is currently active
	if ( ! intervalType && config.isEnabled( 'upgrades/2-year-plans' ) ) {
		const selectedSiteId = getSelectedSiteId( state );
		intervalType = getIntervalTypeFromCurrentPlan( state, selectedSiteId );
	}

	return {
		intervalType,
	};
} )( Plans );
