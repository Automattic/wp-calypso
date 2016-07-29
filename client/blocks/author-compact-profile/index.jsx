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
		author: React.PropTypes.object.isRequired
	},

	render() {
		const author = this.props.author;

		// @todo these need to come from props
		const siteName = 'Bananas';
		const siteUrl = 'http://wpcalypso.wordpress.com';
		const followCount = 123;
		const feedId = 123;
		const siteId = 123;

		return (
			<div className="author-compact-profile">
				<Gravatar size={ 96 } user={ author } />
				<ReaderAuthorLink author={ author }>{ author.display_name }</ReaderAuthorLink>
				<ReaderSiteStreamLink feedId={ feedId } siteId={ siteId }>
					{ siteName }
				</ReaderSiteStreamLink>
				<div className="author-compact-profile__follower-count">
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
				</div>
				<ReaderFollowButton siteUrl={ siteUrl } />
			</div>
		);
	}

} );

export default localize( AuthorCompactProfile );
