/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

const TRACKING_URL_MAP = {
	usps: ( tracking ) => `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${ tracking }`,
	fedex: ( tracking ) =>
		`https://www.fedex.com/apps/fedextrack/?action=track&tracknumbers=${ tracking }`,
	ups: ( tracking ) => `https://www.ups.com/track?loc=en_US&tracknum=${ tracking }`,
	dhlexpress: ( tracking ) =>
		`https://www.dhl.com/en/express/tracking.html?AWB=${ tracking }&brand=DHL`,
};

const TrackingLink = ( { tracking, carrierId, translate } ) => {
	if ( ! tracking ) {
		return <span>{ translate( 'N/A' ) }</span>;
	}

	const urlGenerator = TRACKING_URL_MAP[ carrierId ];
	if ( ! urlGenerator ) {
		return <span>{ tracking }</span>;
	}

	return (
		<a target="_blank" rel="noopener noreferrer" href={ urlGenerator( tracking ) }>
			{ tracking } <Gridicon icon="external" size={ 12 } />
		</a>
	);
};

TrackingLink.propTypes = {
	tracking: PropTypes.string,
	carrierId: PropTypes.string,
};

export default localize( TrackingLink );
