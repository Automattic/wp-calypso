/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessSelectLocationButton from './button';
import HeaderCake from 'components/header-cake';
import KeyringConnectButton from 'blocks/keyring-connect-button';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import { connectGoogleMyBusinessLocation } from 'state/google-my-business/actions';
import { enhanceWithLocationCounts } from 'my-sites/google-my-business/utils';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';
import { withEnhancers } from 'state/utils';

class GoogleMyBusinessSelectLocation extends Component {
	static propTypes = {
		locations: PropTypes.arrayOf( PropTypes.object ).isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		recordTracksEventWithLocationCounts: PropTypes.func.isRequired,
		requestKeyringConnections: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/new/${ this.props.siteSlug }` );
	};

	handleLocationSelected = () => {
		page.redirect( `/google-my-business/stats/${ this.props.siteSlug }` );
	};

	trackAddYourBusinessClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_location_add_your_business_button_click'
		);
	};

	handleConnect = () => {
		this.props.recordTracksEventWithLocationCounts(
			'calypso_google_my_business_select_location_connect'
		);
	};

	trackUseAnotherGoogleAccountClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_location_use_another_google_account_button_click'
		);
	};

	componentDidMount() {
		this.props.requestKeyringConnections( true );
	}

	render() {
		const { locations, siteId, translate } = this.props;

		return (
			<Main className="gmb-select-location" wideLayout>
				<PageViewTracker
					path="/google-my-business/select-location/:site"
					title="Google My Business > Select Location"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<QuerySiteKeyrings siteId={ siteId } />
				<QueryKeyringConnections />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<CompactCard>
					{ translate( 'Select the listing you would like to connect to:' ) }
				</CompactCard>

				{ locations.map( location => (
					<GoogleMyBusinessLocation key={ location.ID } location={ location } isCompact>
						<GoogleMyBusinessSelectLocationButton
							location={ location }
							onSelected={ this.handleLocationSelected }
						/>
					</GoogleMyBusinessLocation>
				) ) }

				<Card className="gmb-select-location__help">
					<p>{ translate( "Don't see the listing you are trying to connect?" ) }</p>

					<div className="gmb-select-location__help-actions">
						<Button
							href={ 'https://business.google.com/create' }
							target="_blank"
							onClick={ this.trackAddYourBusinessClick }
						>
							{ translate( 'Add your Business' ) } <Gridicon icon="external" />
						</Button>

						<KeyringConnectButton
							serviceId="google_my_business"
							forceReconnect={ true }
							onClick={ this.trackUseAnotherGoogleAccountClick }
							onConnect={ this.handleConnect }
						>
							{ translate( 'Use another Google Account' ) }
						</KeyringConnectButton>
					</div>
				</Card>
			</Main>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const locations = getGoogleMyBusinessLocations( state, siteId );

		return {
			locations,
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		connectGoogleMyBusinessLocation,
		recordTracksEvent: withEnhancers( recordTracksEvent, enhanceWithSiteType ),
		recordTracksEventWithLocationCounts: withEnhancers( recordTracksEvent, [
			enhanceWithLocationCounts,
			enhanceWithSiteType,
		] ),
		requestKeyringConnections,
	}
)( localize( GoogleMyBusinessSelectLocation ) );
