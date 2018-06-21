/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import ClipboardButtonInput from 'components/clipboard-button-input';
import SectionHeader from 'components/section-header';
import PodcastingPrivateSiteMessage from './private-site';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isPrivateSite from 'state/selectors/is-private-site';
import { getSupportSiteLocale } from 'lib/i18n-utils';

class PodcastingLink extends Component {
	render() {
		const { isPodcastingEnabled, translate } = this.props;

		const classes = classnames( 'podcasting-details__link', {
			'is-enabled': isPodcastingEnabled,
		} );

		return (
			<div className={ classes }>
				<SectionHeader label={ translate( 'Podcasting' ) } />
				<Card className="podcasting-details__link-card">{ this.renderCardBody() }</Card>
			</div>
		);
	}

	renderCardBody() {
		const { isPrivate, isPodcastingEnabled, detailsLink, translate } = this.props;

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
						{ this.renderSupportLink() }
					</div>
					<Button className="podcasting-details__link-button" href={ detailsLink }>
						{ translate( 'Set Up' ) }
					</Button>
				</div>
			);
		}

		return (
			<Fragment>
				<div className="podcasting-details__link-action-container">
					<div className="podcasting-details__link-info">
						<Gridicon icon="microphone" size={ 24 } />
						<span className="podcasting-details__link-info-text">
							{ translate(
								'Publish blog posts in the {{strong}}%s{{/strong}} category to add new episodes.',
								{
									args: 'CATEGORY NAME',
									components: { strong: <strong /> },
								}
							) }
						</span>
					</div>
					<Button className="podcasting-details__link-button" href={ detailsLink }>
						{ translate( 'Manage Details' ) }
					</Button>
				</div>
				<div className="podcasting-details__link-feed">
					<div className="podcasting-details__link-feed-label">{ translate( 'RSS Feed' ) }</div>
					<ClipboardButtonInput
						className="podcasting-details__link-feed-url"
						value="FEED URL HERE"
					/>
					<div className="podcasting-details__link-feed-info">
						{ translate(
							'Copy your feed URL and submit it to Apple Podcasts and other podcasting services.'
						) }
						{ ' ' }
						{ this.renderSupportLink() }
					</div>
				</div>
			</Fragment>
		);
	}

	renderSupportLink() {
		const { supportLink, translate } = this.props;

		return translate( '{{a}}Learn more{{/a}}', {
			components: {
				a: <ExternalLink href={ supportLink } target="_blank" icon iconSize={ 14 } />,
			},
		} );
	}
}

export default connect( ( state, ownProps ) => {
	const { fields } = ownProps;

	const podcastingCategoryId = Number( fields && fields.podcasting_category_id );
	const isPodcastingEnabled = podcastingCategoryId > 0;

	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const detailsLink = `/settings/podcasting/${ siteSlug }`;
	const supportLink =
		'https://' + getSupportSiteLocale() + '.support.wordpress.com/audio/podcasting/';

	return {
		siteSlug,
		isPrivate: isPrivateSite( state, siteId ),
		isPodcastingEnabled,
		detailsLink,
		supportLink,
	};
} )( localize( PodcastingLink ) );
