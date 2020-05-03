/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { connectGoogleMyBusinessLocation } from 'state/google-my-business/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { enhanceWithLocationCounts } from 'my-sites/google-my-business/utils';
import { withEnhancers } from 'state/utils';

class GoogleMyBusinessSelectLocationButton extends Component {
	static propTypes = {
		connectGoogleMyBusinessLocation: PropTypes.func.isRequired,
		location: PropTypes.object.isRequired,
		recordTracksEventWithLocationCounts: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
		onSelected: PropTypes.func,
	};

	static defaultProps = {
		onSelected: noop,
	};

	connectLocation = () => {
		const { location, onSelected, siteId } = this.props;

		this.props.recordTracksEventWithLocationCounts(
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
					/>{ ' ' }
					{ translate( 'Connected' ) }
				</div>
			);
		}

		return (
			<Button onClick={ this.connectLocation } primary>
				{ translate( 'Connect Location' ) }
			</Button>
		);
	}
}

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{
		connectGoogleMyBusinessLocation,
		recordTracksEventWithLocationCounts: withEnhancers( recordTracksEvent, [
			enhanceWithLocationCounts,
			enhanceWithSiteType,
		] ),
	}
)( localize( GoogleMyBusinessSelectLocationButton ) );
