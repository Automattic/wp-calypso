/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { PLAN_PERSONAL } from 'lib/plans/constants';
import { abtest } from 'lib/abtest';

const FreeToPaidNudge = () => {
	if ( abtest( 'freeToPaidUpsell' ) !== 'sidebar' ) {
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

export default FreeToPaidNudge;
