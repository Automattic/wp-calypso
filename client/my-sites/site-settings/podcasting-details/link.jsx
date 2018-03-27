/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class PodcastingLink extends Component {
	render() {
		const { fields, siteSlug, translate } = this.props;
		const podcastingEnabled = !! fields.podcasting_archive;
		const detailsLink = `/settings/podcasting/${ siteSlug }`;

		return (
			<div className="podcasting-details__link">
				<SectionHeader label={ translate( 'Podcasting' ) } />
				<Card className="podcasting-details__link-card" href={ detailsLink }>
					<div className="podcasting-details__link-title">
						{ podcastingEnabled
							? translate( 'Manage Podcasting' )
							: translate( 'Enable Podcasting' ) }
					</div>
					<div className="podcasting-details__link-info">
						{ translate(
							'Publish a podcast feed to Apple Podcasts and other podcasting services'
						) }
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( PodcastingLink ) );
