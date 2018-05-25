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
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { recordTracksEventWithLocationCounts } from 'my-sites/google-my-business/utils';
import { requestKeyringConnections } from 'state/sharing/keyring/actions';

class GoogleMyBusinessSelectLocation extends Component {
	static propTypes = {
		connectedLocation: PropTypes.object,
		locations: PropTypes.arrayOf( PropTypes.object ).isRequired,
		requestKeyringConnections: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
		trackAddYourBusinessClick: PropTypes.func.isRequired,
		trackConnect: PropTypes.func.isRequired,
		trackUseAnotherGoogleAccountClick: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/new/${ this.props.siteSlug }` );
	};

	handleLocationSelected = () => {
		const { siteSlug } = this.props;
		page.redirect( `/google-my-business/stats/${ siteSlug }` );
	};

	trackAddYourBusinessClick = () => {
		this.props.trackAddYourBusinessClick();
	};

	handleConnect = () => {
		this.props.trackConnect();
	};

	trackUseAnotherGoogleAccountClick = () => {
		this.props.trackUseAnotherGoogleAccountClick();
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
		recordTracksEvent,
		requestKeyringConnections,
	},
	( stateProps, dispatchProps, ownProps ) => {
		const path = '/google-my-business/new/:site';

		return {
			...ownProps,
			...stateProps,
			...dispatchProps,
			trackAddYourBusinessClick: () =>
				dispatchProps.recordTracksEvent( 'calypso_google_my_business_select_location_add_your_business_button_click', {
					path,
				} ),
			trackConnect: () =>
				recordTracksEventWithLocationCounts(
					stateProps,
					dispatchProps,
					'calypso_google_my_business_select_location_connect',
					path
				),
			trackUseAnotherGoogleAccountClick: () =>
				dispatchProps.recordTracksEvent( 'calypso_google_my_business_select_location_use_another_google_account_button_click', {
					path,
				} ),
		};
	}
)( localize( GoogleMyBusinessSelectLocation ) );
