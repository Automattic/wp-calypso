/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import {
	PLAN_PERSONAL,
} from 'lib/plans/constants';
import { abtest } from 'lib/abtest';
import {
	eligibleForFreeToPaidUpsell,
} from 'state/selectors';

const FreeToPaidBanner = ( props ) => {
	if ( ! props.eligibleForFreeToPaidUpsell || abtest( 'freeToPaidUpsell' ) !== 'banner' ) {
		return null;
	}

	return (
		<Banner
			event="free-to-paid-stats-nudge"
			plan={ PLAN_PERSONAL }
			icon="star"
			title="Get a free custom domain name with a WordPress.com plan!"
			description="Choose a unique custom domain name to make it easier for people to find and visit your site."
		/>
	);
};

export default connect( ( state, ownProps ) => {
	const siteId = ownProps.site && ownProps.site.ID ? ownProps.site.ID : null;
	return {
		eligibleForFreeToPaidUpsell: eligibleForFreeToPaidUpsell( state, siteId, i18n.moment() ),
	};
} )( FreeToPaidBanner );
