/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderAuthorLink from 'blocks/reader-author-link';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import ReaderFollowButton from 'reader/follow-button';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import { getStreamUrl } from 'reader/route';
import { numberFormat } from 'i18n-calypso';
import { has, includes } from 'lodash';

const AuthorCompactProfile = React.createClass( {
	propTypes: {
		author: React.PropTypes.object.isRequired,
		siteName: React.PropTypes.string,
		siteUrl: React.PropTypes.string,
		feedUrl: React.PropTypes.string,
		followCount: React.PropTypes.number,
		feedId: React.PropTypes.number,
		siteId: React.PropTypes.number,
		siteIcon: React.PropTypes.string,
		feedIcon: React.PropTypes.string
	},

	render() {
		const { author, siteIcon, feedIcon, siteName, siteUrl, feedUrl, followCount, feedId, siteId } = this.props;

		if ( ! author ) {
			return null;
		}

		const hasAuthorName = has( author, 'name' );
		const hasMatchingAuthorAndSiteNames = hasAuthorName && siteName.toLowerCase() === author.name.toLowerCase();
		const classes = classnames( 'author-compact-profile', {
			'has-author-link': ! hasMatchingAuthorAndSiteNames
		} );
		const streamUrl = getStreamUrl( feedId, siteId );
		const authorNameBlacklist = [ 'admin' ];

		// If we have a feed URL, use that for the follow button in preference to the site URL
		const followUrl = feedUrl || siteUrl;

		return (
			<div className={ classes }>
				<a href={ streamUrl }>
					<ReaderAvatar siteIcon={ siteIcon } feedIcon={ feedIcon } author={ author } />
				</a>
				{ hasAuthorName && ! hasMatchingAuthorAndSiteNames && ! includes( authorNameBlacklist, author.name.toLowerCase() ) &&
					<ReaderAuthorLink author={ author } siteUrl={ streamUrl }>{ author.name }</ReaderAuthorLink> }
				{ siteName &&
					<ReaderSiteStreamLink className="author-compact-profile__site-link" feedId={ feedId } siteId={ siteId }>
						{ siteName }
					</ReaderSiteStreamLink> }

				<div className="author-compact-profile__follow">
				{ followCount
					? <div className="author-compact-profile__follow-count">
					{ this.props.translate(
						'%(followCount)s follower',
						'%(followCount)s followers',
						{
							count: followCount,
							args: {
								followCount: numberFormat( followCount )
							}
						}
					) }
					</div> : null }

					{ followUrl && <ReaderFollowButton siteUrl={ followUrl } /> }
				</div>
			</div>
		);
	}

} );

export default localize( AuthorCompactProfile );
