/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import ActionCard from 'components/action-card';
import { Button, Card } from '@automattic/components';
import canCurrentUser from 'state/selectors/can-current-user';
import CardHeading from 'components/card-heading';
import DocumentHead from 'components/data/document-head';
import ExternalLink from 'components/external-link';
import getGoogleMyBusinessLocations from 'state/selectors/get-google-my-business-locations';
import HeaderCake from 'components/header-cake';
import KeyringConnectButton from 'blocks/keyring-connect-button';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import QueryKeyringServices from 'components/data/query-keyring-services';
import { enhanceWithLocationCounts } from 'my-sites/google-my-business/utils';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { withEnhancers } from 'state/utils';
import { connectGoogleMyBusinessAccount } from 'state/google-my-business/actions';

/**
 * Style dependencies
 */
import './style.scss';

class GoogleMyBusinessSelectBusinessType extends Component {
	static propTypes = {
		locations: PropTypes.array.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		recordTracksEventWithLocationCounts: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteIsJetpack: PropTypes.bool.isRequired,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/marketing/tools/${ this.props.siteSlug }` );
	};

	handleConnect = ( keyringConnection ) => {
		const { siteId, siteSlug } = this.props;

		this.props.connectGoogleMyBusinessAccount( siteId, keyringConnection.ID ).then( () => {
			this.props.recordTracksEventWithLocationCounts(
				'calypso_google_my_business_select_business_type_connect'
			);
			page.redirect( `/google-my-business/${ siteSlug }` );
		} );
	};

	trackCreateListingClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_create_listing_button_click'
		);
	};

	trackConnectToGoogleMyBusinessClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_connect_to_google_my_business_button_click'
		);
	};

	trackLearnMoreAboutSEOClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_learn_more_about_seo_button_click'
		);
	};

	trackGoogleMyBusinessClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_google_my_business_link_click'
		);
	};

	renderLocalBusinessCard() {
		const { canUserManageOptions, translate } = this.props;

		let connectButton;

		if ( canUserManageOptions ) {
			connectButton = (
				<KeyringConnectButton
					serviceId="google_my_business"
					onClick={ this.trackConnectToGoogleMyBusinessClick }
					onConnect={ this.handleConnect }
					forceReconnect
					primary
				>
					{ translate( 'Connect to Google My Business', {
						comment:
							'Call to Action to connect the site to a business listing in Google My Business',
					} ) }
				</KeyringConnectButton>
			);
		} else {
			connectButton = (
				<Button
					primary
					href="https://business.google.com/create"
					target="_blank"
					onClick={ this.trackCreateListingClick }
				>
					{ translate( 'Create Listing', {
						comment: 'Call to Action to add a business listing to Google My Business',
					} ) }{ ' ' }
					<Gridicon icon="external" />
				</Button>
			);
		}
		return (
			<ActionCard
				headerText={ translate( 'Physical Location or Service Area', {
					comment: 'In the context of a business activity, brick and mortar or online service',
				} ) }
				mainText={ translate(
					'Your business has a physical location customers can visit, ' +
						'or provides goods and services to local customers, or both.'
				) }
			>
				{ connectButton }
			</ActionCard>
		);
	}

	renderOnlineBusinessCard() {
		const { siteIsJetpack, translate } = this.props;

		const seoHelpLink = siteIsJetpack
			? 'https://jetpack.com/support/seo-tools/'
			: 'https://blog.wordpress.com/seo/';

		return (
			<ActionCard
				headerText={ translate( 'Online Only', {
					comment: 'In the context of a business activity, as opposed to a brick and mortar',
				} ) }
				mainText={ translate(
					"Don't provide in-person services? Learn more about reaching your customers online."
				) }
				buttonTarget="_blank"
				buttonText={ translate( 'Learn More about SEO', { comment: 'Call to Action button' } ) }
				buttonHref={ seoHelpLink }
				buttonIcon="external"
				buttonOnClick={ this.trackLearnMoreAboutSEOClick }
			/>
		);
	}

	render() {
		const { siteId, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Main className="gmb-select-business-type" wideLayout>
				<PageViewTracker
					path="/google-my-business/select-business-type/:site"
					title="Google My Business > Select Business Type"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<QueryKeyringServices />
				<QuerySiteKeyrings siteId={ siteId } />
				<QueryKeyringConnections />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card className="gmb-select-business-type__explanation">
					<div className="gmb-select-business-type__explanation-main">
						<CardHeading tagName="h1" size={ 24 }>
							{ translate( 'Which type of business are you?' ) }
						</CardHeading>

						<p>
							{ translate(
								'{{link}}Google My Business{{/link}} lists your local business on Google Search and Google Maps. ' +
									'It works for businesses that have a physical location, or serve a local area.',
								{
									components: {
										link: (
											<ExternalLink
												href="https://www.google.com/business/"
												target="_blank"
												rel="noopener noreferrer"
												icon={ true }
												onClick={ this.trackGoogleMyBusinessClick }
											/>
										),
									},
								}
							) }
						</p>
					</div>

					<img
						className="gmb-select-business-type__illustration"
						src="/calypso/images/google-my-business/business-local.svg"
						alt={ translate( 'Local business illustration' ) }
					/>
				</Card>

				{ this.renderLocalBusinessCard() }

				{ this.renderOnlineBusinessCard() }
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			locations: getGoogleMyBusinessLocations( state, siteId ),
			canUserManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
			siteId,
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		recordTracksEvent: withEnhancers( recordTracksEvent, enhanceWithSiteType ),
		recordTracksEventWithLocationCounts: withEnhancers( recordTracksEvent, [
			enhanceWithLocationCounts,
			enhanceWithSiteType,
		] ),
		connectGoogleMyBusinessAccount,
	}
)( localize( GoogleMyBusinessSelectBusinessType ) );
