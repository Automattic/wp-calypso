/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { connectGoogleMyBusinessLocation } from 'state/google-my-business/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessSelectLocationButton extends Component {
	static propTypes = {
		connectGoogleMyBusinessLocation: PropTypes.func.isRequired,
		location: PropTypes.object.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
		onSelected: PropTypes.func,
	};

	static defaultProps = {
		onSelected: noop,
	};

	connectLocation = () => {
		const { location, onSelected, siteId } = this.props;

		this.props.recordTracksEvent(
			'calypso_google_my_business_select_location_connect_location_button_click'
		);

		this.props
			.connectGoogleMyBusinessLocation( siteId, location.keyringConnectionId, location.ID )
			.then( () => {
				onSelected( location );
			} );
	};

	render() {
		const { location, translate } = this.props;

		if ( location.isConnected ) {
			return (
				<div className="gmb-select-location__status">
					<Gridicon
						className="gmb-select-location__connected-icon"
						icon="checkmark-circle"
						size={ 18 }
					/>{' '}
					{ translate( 'Connected' ) }
				</div>
			);
		}

		return <Button onClick={ this.connectLocation }>{ translate( 'Connect Location' ) }</Button>;
	}
}

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{
		connectGoogleMyBusinessLocation,
		recordTracksEvent,
	}
)( localize( GoogleMyBusinessSelectLocationButton ) );
