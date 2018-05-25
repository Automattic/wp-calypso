/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';
import HeaderCake from 'components/header-cake';
import KeyringConnectButton from 'blocks/keyring-connect-button';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { dismissNudge } from 'blocks/google-my-business-stats-nudge/actions';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { recordTracksEventWithLocationCounts } from 'my-sites/google-my-business/utils';

class GoogleMyBusinessNewAccount extends Component {
	static propTypes = {
		locations: PropTypes.arrayOf( PropTypes.object ).isRequired,
		siteSlug: PropTypes.string,
		trackConnect: PropTypes.func.isRequired,
		trackCreateListingClick: PropTypes.func.isRequired,
		trackNoThanksClick: PropTypes.func.isRequired,
		trackUseAnotherGoogleAccountClick: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/select-business-type/${ this.props.siteSlug }` );
	};

	trackUseAnotherGoogleAccountClick = () => {
		this.props.trackUseAnotherGoogleAccountClick();
	};

	trackCreateListingClick = () => {
		this.props.trackCreateListingClick();
	};

	handleConnect = () => {
		this.props.trackConnect();

		page.redirect( `/google-my-business/${ this.props.siteSlug }` );
	};

	handleNoThanksClick = () => {
		this.props.trackNoThanksClick();
		this.props.dismissNudge();
	};

	render() {
		const { siteSlug, translate } = this.props;

		return (
			<Main className="gmb-new-account" wideLayout>
				<PageViewTracker path="/google-my-business/new/:site" title="Google My Business > New" />

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<div className="gmb-new-account__wrapper">
						<img
							alt={ translate( 'Local business illustration' ) }
							className="gmb-new-account__illustration"
							src="/calypso/images/google-my-business/business-local.svg"
						/>

						<h1 className="gmb-new-account__heading">
							{ translate( 'It looks like you might be new to Google My Business' ) }
						</h1>

						<p>
							{ translate(
								'Google My Business lists your local business on Google Search and Google Maps. ' +
									'It works for businesses that have a physical location, or serve a local area.'
							) }
						</p>

						<div className="gmb-new-account__actions">
							<Button
								href={ 'https://business.google.com/create' }
								target="_blank"
								onClick={ this.trackCreateListingClick }
								primary
							>
								{ translate( 'Create Listing' ) } <Gridicon icon="external" />
							</Button>

							<KeyringConnectButton
								serviceId="google_my_business"
								forceReconnect={ true }
								onClick={ this.trackUseAnotherGoogleAccountClick }
								onConnect={ this.handleConnect }
							>
								{ translate( 'Use another Google Account' ) }
							</KeyringConnectButton>

							<Button href={ `/stats/${ siteSlug }` } onClick={ this.handleNoThanksClick }>
								{ translate( 'No thanks' ) }
							</Button>
						</div>
					</div>
				</Card>
			</Main>
		);
	}
}

export default connect(
	state => ( {
		siteSlug: getSelectedSiteSlug( state ),
		locations: getGoogleMyBusinessLocations( state, getSelectedSiteId( state ) ),
	} ),
	{
		dismissNudge,
		recordTracksEvent,
	},
	( stateProps, dispatchProps, ownProps ) => {
		const path = '/google-my-business/new/:site';

		return {
			...ownProps,
			...stateProps,
			...dispatchProps,
			trackConnect: () =>
				recordTracksEventWithLocationCounts(
					stateProps,
					dispatchProps,
					'calypso_google_my_business_new_account_connect',
					path
				),
			trackCreateListingClick: () =>
				dispatchProps.recordTracksEvent( 'calypso_google_my_business_new_account_create_listing_button_click', {
					path,
				} ),
			trackNoThanksClick: () =>
				dispatchProps.recordTracksEvent( 'calypso_google_my_business_new_account_no_thanks_button_click', {
					path,
				} ),
			trackUseAnotherGoogleAccountClick: () =>
				dispatchProps.recordTracksEvent( 'calypso_google_my_business_new_account_use_another_google_account_button_click', {
					path,
				} ),
		};
	}
)( localize( GoogleMyBusinessNewAccount ) );
