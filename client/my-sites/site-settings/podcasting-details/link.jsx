/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import PodcastFeedUrl from './feed-url';
import PodcastingPrivateSiteMessage from './private-site';
import PodcastingSupportLink from './support-link';
import PodcastingPublishNotice from './publish-notice';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { getTerm } from 'calypso/state/terms/selectors';

class PodcastingLink extends Component {
	render() {
		const { isPodcastingEnabled, translate } = this.props;

		const classes = classnames( 'podcasting-details__link', {
			'is-enabled': isPodcastingEnabled,
		} );

		return (
			<div className={ classes }>
				<SettingsSectionHeader
					id="podcasting-details__link-header"
					title={ translate( 'Podcasting' ) }
				/>
				<Card className="podcasting-details__link-card">{ this.renderCardBody() }</Card>
			</div>
		);
	}

	renderCardBody() {
		const {
			isPrivate,
			isPodcastingEnabled,
			podcastingCategoryId,
			detailsLink,
			translate,
		} = this.props;

		if ( isPrivate ) {
			return <PodcastingPrivateSiteMessage />;
		}

		if ( ! isPodcastingEnabled ) {
			return (
				<div className="podcasting-details__link-action-container">
					<div className="podcasting-details__link-info">
						{ translate(
							'Publish a podcast feed to Apple Podcasts and other podcasting services.'
						) }
						<br />
						<PodcastingSupportLink />
					</div>
					<Button className="podcasting-details__link-button" href={ detailsLink }>
						{ translate( 'Set up' ) }
					</Button>
				</div>
			);
		}

		return (
			<Fragment>
				<div className="podcasting-details__link-action-container">
					<PodcastingPublishNotice podcastingCategoryId={ podcastingCategoryId } />
					<Button className="podcasting-details__link-button" href={ detailsLink }>
						{ translate( 'Manage Details' ) }
					</Button>
				</div>
				<div className="podcasting-details__link-feed">
					<PodcastFeedUrl categoryId={ podcastingCategoryId } />
				</div>
			</Fragment>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { fields } = ownProps;

	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const podcastingCategoryId = Number( fields && fields.podcasting_category_id );
	const podcastingCategory =
		podcastingCategoryId > 0 && getTerm( state, siteId, 'category', podcastingCategoryId );

	const detailsLink = `/settings/podcasting/${ siteSlug }`;

	return {
		siteSlug,
		isPrivate: isPrivateSite( state, siteId ),
		isPodcastingEnabled: !! podcastingCategory,
		podcastingCategoryId,
		detailsLink,
	};
} )( localize( PodcastingLink ) );
