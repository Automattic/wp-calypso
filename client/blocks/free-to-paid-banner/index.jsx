/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';
import { noop } from 'lodash';

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
import { getSelectedSiteId } from 'state/ui/selectors';

const FreeToPaidBanner = ( props ) => {
	if ( ! props.eligibleForFreeToPaidUpsell || abtest( 'freeToPaidUpsell' ) !== 'banner' ) {
		return null;
	}

	const { translate = noop } = props;
	const title = translate( 'Get a free custom domain name with a WordPress.com plan!' );
	const description = translate( 'Choose a unique custom domain name to make it easier for people to find and visit your site.' );

	return (
		<Banner
			event="free-to-paid-stats-nudge"
			plan={ PLAN_PERSONAL }
			icon="star"
			title={ title }
			description={ description }
		/>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		eligibleForFreeToPaidUpsell: eligibleForFreeToPaidUpsell( state, siteId, moment() ),
	};
} )( localize( FreeToPaidBanner ) );
