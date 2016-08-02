/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import ReaderAuthorLink from 'components/reader-author-link';
import ReaderSiteStreamLink from 'components/reader-site-stream-link';
import ReaderFollowButton from 'reader/follow-button';
import { localize } from 'i18n-calypso';

const AuthorCompactProfile = React.createClass( {
	propTypes: {
		author: React.PropTypes.object.isRequired,
		siteName: React.PropTypes.string,
		siteUrl: React.PropTypes.string,
		followCount: React.PropTypes.number,
		feedId: React.PropTypes.number,
		siteId: React.PropTypes.number
	},

	render() {
		const { author, siteName, siteUrl, followCount, feedId, siteId } = this.props;

		if ( ! author ) {
			return null;
		}

		return (
			<div className="author-compact-profile">
				<Gravatar size={ 96 } user={ author } />
				<ReaderAuthorLink author={ author }>{ author.name }</ReaderAuthorLink>
				{ siteName && siteUrl
					? <ReaderSiteStreamLink className="author-compact-profile__site-link" feedId={ feedId } siteId={ siteId }>
						{ siteName }
					</ReaderSiteStreamLink> : null }

				<div className="author-compact-profile__follow">
				{ followCount
					? <div className="author-compact-profile__follow-count">
					{ this.props.translate(
						'%(followCount)d follower',
						'%(followCount)d followers',
						{
							count: followCount,
							args: {
								followCount: followCount
							}
						}
					) }
					</div> : null }

				<ReaderFollowButton siteUrl={ siteUrl } />
				</div>
			</div>
		);
	}

} );

export default localize( AuthorCompactProfile );
