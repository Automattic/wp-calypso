/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { PLAN_PERSONAL } from 'lib/plans/constants';
import { abtest } from 'lib/abtest';
import {
	eligibleForFreeToPaidUpsell,
} from 'state/selectors';

const FreeToPaidNudge = ( props ) => {
	if ( props.eligibleForFreeToPaidUpsell && abtest( 'freeToPaidUpsell' ) !== 'sidebar' ) {
		return null;
	}

	return (
		<Banner
			event="free-to-paid-stats-nudge"
			plan={ PLAN_PERSONAL }
			title="Upgrade to attract more traffic"
		/>
	);
};

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
	return {
		eligibleForFreeToPaidUpsell: eligibleForFreeToPaidUpsell( state, siteId ),
	};
} )( FreeToPaidNudge );
