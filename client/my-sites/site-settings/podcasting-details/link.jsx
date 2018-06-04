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
import PodcastingPrivateSiteMessage from './private-site';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isPrivateSite from 'state/selectors/is-private-site';

class PodcastingLink extends Component {
	render() {
		const { fields, siteSlug, isPrivate, translate } = this.props;

		if ( isPrivate ) {
			return (
				<div className="podcasting-details__link">
					<SectionHeader label={ translate( 'Podcasting' ) } />
					<Card className="podcasting-details__link-card">
						<PodcastingPrivateSiteMessage />
					</Card>
				</div>
			);
		}

		const podcastingEnabled =
			fields && fields.podcasting_category_id && Number( fields.podcasting_category_id ) > 0;
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
							'Publish a podcast feed to Apple Podcasts and other podcasting services.'
						) }
					</div>
				</Card>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: getSelectedSiteSlug( state ),
		isPrivate: isPrivateSite( state, siteId ),
	};
} )( localize( PodcastingLink ) );
