/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

const TRACKING_URL_MAP = {
	usps: ( tracking ) => `https://tools.usps.com/go/TrackConfirmAction.action?tLabels=${ tracking }`,
	fedex: ( tracking ) =>
		`https://www.fedex.com/apps/fedextrack/?action=track&tracknumbers=${ tracking }`,
};

const TrackingLink = ( { tracking, carrierId, translate } ) => {
	if ( ! tracking ) {
		return <span>{ translate( 'N/A' ) }</span>;
	}
	const url = TRACKING_URL_MAP[ carrierId ]( tracking );
	if ( ! url ) {
		return <span>{ tracking }</span>;
	}
	return (
		<a target="_blank" rel="noopener noreferrer" href={ url }>
			{ tracking } <Gridicon icon="external" size={ 12 } />
		</a>
	);
};

TrackingLink.propTypes = {
	tracking: PropTypes.string,
	carrierId: PropTypes.string,
};

export default localize( TrackingLink );
