/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessLocationType from 'my-sites/google-my-business/location/location-type';
import { connectGoogleMyBusinessLocation } from 'state/google-my-business/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessSelectLocationButton extends Component {
	static propTypes = {
		connectGoogleMyBusinessLocation: PropTypes.func.isRequired,
		location: GoogleMyBusinessLocationType.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	connectLocation = () => {
		this.props.connectGoogleMyBusinessLocation( this.props.siteId, this.props.location.id );

		this.props.recordTracksEvent(
			'calypso_google_my_business_select_location_connect_location_button_click'
		);
	};

	render() {
		const { location, siteSlug, translate } = this.props;

		return (
			<GoogleMyBusinessLocation isCompact location={ location }>
				<Button href={ `/google-my-business/stats/${ siteSlug }` } onClick={ this.connectLocation }>
					{ translate( 'Connect Location' ) }
				</Button>
			</GoogleMyBusinessLocation>
		);
	}
}

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		connectGoogleMyBusinessLocation,
		recordTracksEvent,
	}
)( localize( GoogleMyBusinessSelectLocationButton ) );
