/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

const TRACKING_URL_MAP = {
	usps: ( tracking ) => `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${ tracking }`,
	fedex: ( tracking ) => `https://www.fedex.com/apps/fedextrack/?action=track&tracknumbers=${ tracking }`,
};

const TrackingLink = ( { tracking, carrier_id, translate } ) => {
	if ( ! tracking ) {
		return <span>{ translate( 'N/A' ) }</span>;
	}
	const url = TRACKING_URL_MAP[ carrier_id ]( tracking );
	if ( ! url ) {
		return <span>{ tracking }</span>;
	}
	return <a target="_blank" rel="noopener noreferrer" href={ url }>{ tracking }</a>;
};

TrackingLink.propTypes = {
	tracking: PropTypes.string,
	carrier_id: PropTypes.string,
};

export default localize( TrackingLink );
