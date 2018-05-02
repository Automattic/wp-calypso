/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ActionCard from 'components/action-card';
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import config from 'config';
import DocumentHead from 'components/data/document-head';
import ExternalLink from 'components/external-link';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import KeyringConnectButton from 'blocks/keyring-connect-button';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { canCurrentUser, getGoogleMyBusinessLocations } from 'state/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import QuerySiteSettings from 'components/data/query-site-settings';
import QueryKeyringConnections from 'components/data/query-keyring-connections';

class GoogleMyBusinessSelectBusinessType extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/stats/day/${ this.props.siteSlug }` );
	};

	handleConnect = () => {
		const { googleMyBusinessLocations, siteSlug } = this.props;

		const locationCount = googleMyBusinessLocations.length;
		const verifiedLocationCount = googleMyBusinessLocations.filter( location => {
			return get( location, 'meta.state.isVerified', false );
		} ).length;

		this.props.recordTracksEvent( 'calypso_google_my_business_select_business_type_connect', {
			location_count: locationCount,
			verified_location_count: verifiedLocationCount,
		} );

		if ( locationCount === 0 ) {
			page.redirect( `/google-my-business/new/${ siteSlug }` );
		} else {
			page.redirect( `/google-my-business/select-location/${ siteSlug }` );
		}
	};

	trackCreateYourListingClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_create_my_listing_button_click'
		);
	};

	trackOptimizeYourSEOClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_business_type_optimize_your_seo_button_click'
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

		if ( config.isEnabled( 'google-my-business' ) && canUserManageOptions ) {
			connectButton = (
				<KeyringConnectButton
					serviceId="google_my_business"
					onClick={ this.trackCreateYourListingClick }
					onConnect={ this.handleConnect }
				>
					{ translate( 'Create Your Listing', {
						comment: 'Call to Action to add a business listing to Google My Business',
					} ) }
				</KeyringConnectButton>
			);
		} else {
			connectButton = (
				<Button
					primary
					href="https://business.google.com/create"
					target="_blank"
					onClick={ this.trackCreateYourListingClick }
				>
					{ translate( 'Create Your Listing', {
						comment: 'Call to Action to add a business listing to Google My Business',
					} ) }{' '}
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
		const { siteSlug, translate } = this.props;

		return (
			<ActionCard
				headerText={ translate( 'Online Only', {
					comment: 'In the context of a business activity, as opposed to a brick and mortar',
				} ) }
				mainText={ translate(
					"Don't provide in-person services? Learn more about reaching your customers online."
				) }
				buttonText={ translate( 'Optimize Your SEO', { comment: 'Call to Action button' } ) }
				buttonHref={ `/settings/traffic/${ siteSlug }` }
				buttonOnClick={ this.trackOptimizeYourSEOClick }
			/>
		);
	}

	render() {
		const { siteId, translate } = this.props;

		return (
			<Main className="gmb-select-business-type" wideLayout>
				<PageViewTracker
					path="/google-my-business/select-business-type/:site"
					title="Google My Business > Select Business Type"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<QuerySiteSettings siteId={ siteId } />
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
									'It works for businesses that have a physical location or serve a local area.',
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
	state => {
		const siteId = getSelectedSiteId( state );
		return {
			googleMyBusinessLocations: getGoogleMyBusinessLocations( state, siteId ),
			canUserManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( GoogleMyBusinessSelectBusinessType ) );
