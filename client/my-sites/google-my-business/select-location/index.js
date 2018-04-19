/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import ExternalLink from 'components/external-link';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessSelectLocationButton from './button';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'state/analytics/actions';
import { getGoogleMyBusinessLocations } from 'state/selectors';
import { connectGoogleMyBusinessLocation } from 'state/google-my-business/actions';
import QuerySiteSettings from 'components/data/query-site-settings';
import QueryKeyringConnections from 'components/data/query-keyring-connections';

class GoogleMyBusinessSelectLocation extends Component {
	static propTypes = {
		connectedLocation: PropTypes.object,
		locations: PropTypes.arrayOf( PropTypes.object ).isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
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
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_location_add_your_business_link_click'
		);
	};

	render() {
		const { locations, siteId, translate } = this.props;

		return (
			<Main className="gmb-select-location" wideLayout>
				<PageViewTracker
					path="/google-my-business/select-location/:site"
					title="Google My Business > Select Location"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<QuerySiteSettings siteId={ siteId } />
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

				<Card className="gmb-select-location__add">
					{ translate(
						"Don't see the listing you are trying to connect? {{link}}Add your business{{/link}}.",
						{
							components: {
								link: (
									<ExternalLink
										href="https://business.google.com/create"
										target="_blank"
										rel="noopener noreferrer"
										icon={ true }
										onClick={ this.trackAddYourBusinessClick }
									/>
								),
							},
						}
					) }
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
	}
)( localize( GoogleMyBusinessSelectLocation ) );
