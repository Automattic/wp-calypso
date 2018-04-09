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
import Button from 'components/button';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import ExternalLink from 'components/external-link';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import GoogleMyBusinessLocation from 'my-sites/google-my-business/location';
import GoogleMyBusinessLocationType from 'my-sites/google-my-business/location/location-type';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessSelectLocation extends Component {
	static propTypes = {
		locations: PropTypes.arrayOf( GoogleMyBusinessLocationType ).isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/new/${ this.props.siteSlug }` );
	};

	trackAddYourBusinessLinkClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_location_add_your_business_link_click'
		);
	};

	trackConnectLocationButtonClick = () => {
		this.props.recordTracksEvent(
			'calypso_google_my_business_select_location_connect_location_button_click'
		);
	};

	render() {
		const { locations, translate, siteSlug } = this.props;

		return (
			<Main className="gmb-select-location" wideLayout>
				<PageViewTracker
					path="/google-my-business/select-location/:site"
					title="Google My Business > Select Location"
				/>

				<DocumentHead title={ translate( 'Google My Business' ) } />

				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<CompactCard>
					{ translate( 'Select the listing you would like to connect to:' ) }
				</CompactCard>

				{ locations.map( location => (
					<CompactCard className="gmb-location">
						<GoogleMyBusinessLocation key={ location.id } location={ location } />
						<Button
							className="gmb-location__button"
							href={ `/stats/${ siteSlug }` }
							onClick={ this.trackConnectLocationButtonClick }
						>
							{ translate( 'Connect Location' ) }
						</Button>
					</CompactCard>
				) ) }

				<Card className="gmb-select-location__add">
					{ translate(
						"Don't see the listing you are trying to connect? {{link}}Add your business{{/link}}.",
						{
							components: {
								link: (
									<ExternalLink
										href="https://www.google.com/business/"
										target="_blank"
										rel="noopener noreferrer"
										icon={ true }
										onClick={ this.trackAddYourBusinessLinkClick }
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
	state => ( {
		locations: [
			{
				id: 12345,
				address: [
					'Centre Commercial Cap 3000',
					'Avenue Eugene Donadei',
					'06700 Saint-Laurent-du-Var',
					'France',
				],
				name: 'Starbucks',
				photo: 'http://www.shantee.net/wp-content/uploads/2016/02/cookies-internet-1030x684.jpg',
				verified: true,
			},
			{
				id: 67890,
				address: [ '234 Piedmont Drive', 'Talihassee, FL 34342', 'USA' ],
				name: 'Pinch Bakeshop',
				verified: false,
			},
		],
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( GoogleMyBusinessSelectLocation ) );
