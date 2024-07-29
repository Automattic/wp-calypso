import page from '@automattic/calypso-router';
import { Button, Card, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import KeyringConnectButton from 'calypso/blocks/keyring-connect-button';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { enhanceWithLocationCounts } from 'calypso/my-sites/google-my-business/utils';
import { enhanceWithSiteType, recordTracksEvent } from 'calypso/state/analytics/actions';
import { connectGoogleMyBusinessAccount } from 'calypso/state/google-my-business/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { withEnhancers } from 'calypso/state/utils';

import './style.scss';

class GoogleMyBusinessNewAccount extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		recordTracksEventWithLocationCounts: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/select-business-type/${ this.props.siteSlug }` );
	};

	trackUseAnotherGoogleAccountClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_new_account_use_another_google_account_button_click'
		);
	};

	trackCreateListingClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_new_account_create_listing_button_click'
		);
	};

	handleConnect = ( keyringConnection ) => {
		const { siteId } = this.props;

		this.props.connectGoogleMyBusinessAccount( siteId, keyringConnection.ID ).then( () => {
			this.props.recordTracksEventWithLocationCounts(
				'calypso_google_my_business_new_account_connect'
			);
			page.redirect( `/google-my-business/${ this.props.siteSlug }` );
		} );
	};

	handleNoThanksClick = () => {
		this.props.recordTracksEvent( 'calypso_google_my_business_new_account_no_thanks_button_click' );
	};

	render() {
		const { siteSlug, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Main className="gmb-new-account" wideLayout>
				<PageViewTracker
					path="/google-my-business/new/:site"
					title="Google Business Profile > New"
				/>

				<DocumentHead title={ translate( 'Google Business Profile' ) } />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google Business Profile' ) }
				</HeaderCake>

				<Card>
					<div className="gmb-new-account__wrapper">
						<img
							alt={ translate( 'Local business illustration' ) }
							className="gmb-new-account__illustration"
							src="/calypso/images/google-my-business/business-local.svg"
						/>

						<h1 className="gmb-new-account__heading">
							{ translate( 'It looks like you might be new to Google Business Profile' ) }
						</h1>

						<p>
							{ translate(
								'Google Business Profile lists your local business on Google Search and Google Maps. ' +
									'It works for businesses that have a physical location, or serve a local area.'
							) }
						</p>

						<div className="gmb-new-account__actions">
							<Button
								href="https://business.google.com/create"
								target="_blank"
								onClick={ this.trackCreateListingClick }
								primary
							>
								{ translate( 'Create Listing' ) } <Gridicon icon="external" />
							</Button>

							<KeyringConnectButton
								serviceId="google_my_business"
								forceReconnect
								onClick={ this.trackUseAnotherGoogleAccountClick }
								onConnect={ this.handleConnect }
							>
								{ translate( 'Use another Google Account' ) }
							</KeyringConnectButton>

							<Button
								href={ `/marketing/tools/${ siteSlug }` }
								onClick={ this.handleNoThanksClick }
							>
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
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		connectGoogleMyBusinessAccount,
		recordTracksEvent: withEnhancers( recordTracksEvent, enhanceWithSiteType ),
		recordTracksEventWithLocationCounts: withEnhancers( recordTracksEvent, [
			enhanceWithLocationCounts,
			enhanceWithSiteType,
		] ),
	}
)( localize( GoogleMyBusinessNewAccount ) );
