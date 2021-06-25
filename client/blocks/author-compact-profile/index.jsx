/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { numberFormat, localize } from 'i18n-calypso';
import { has } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { getStreamUrl } from 'calypso/reader/route';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import AuthorCompactProfilePlaceholder from './placeholder';

/**
 * Style dependencies
 */
import './style.scss';

class AuthorCompactProfile extends React.Component {
	static propTypes = {
		author: PropTypes.object,
		siteName: PropTypes.string,
		siteUrl: PropTypes.string,
		feedUrl: PropTypes.string,
		followCount: PropTypes.number,
		feedId: PropTypes.number,
		siteId: PropTypes.number,
		siteIcon: PropTypes.string,
		feedIcon: PropTypes.string,
		post: PropTypes.object,
	};

	render() {
		const {
			author,
			siteIcon,
			feedIcon,
			siteName,
			siteUrl,
			feedUrl,
			followCount,
			feedId,
			siteId,
			post,
		} = this.props;

		if ( ! author ) {
			return <AuthorCompactProfilePlaceholder />;
		}

		const hasAuthorName = has( author, 'name' );
		const hasMatchingAuthorAndSiteNames =
			hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, author.name );
		const classes = classnames( {
			'author-compact-profile': true,
			'has-author-link': ! hasMatchingAuthorAndSiteNames,
			'has-author-icon': siteIcon || feedIcon || ( author && author.has_avatar ),
		} );
		const streamUrl = getStreamUrl( feedId, siteId );

		// If we have a feed URL, use that for the follow button in preference to the site URL
		const followUrl = feedUrl || siteUrl;

		return (
			<div className={ classes }>
				<a href={ streamUrl } className="author-compact-profile__avatar-link">
					<ReaderAvatar siteIcon={ siteIcon } feedIcon={ feedIcon } author={ author } />
				</a>
				{ hasAuthorName && ! hasMatchingAuthorAndSiteNames && (
					<ReaderAuthorLink author={ author } siteUrl={ streamUrl } post={ post }>
						{ author.name }
					</ReaderAuthorLink>
				) }
				{ siteName && (
					<ReaderSiteStreamLink
						className="author-compact-profile__site-link"
						feedId={ feedId }
						siteId={ siteId }
						post={ post }
					>
						{ siteName }
					</ReaderSiteStreamLink>
				) }

				<div className="author-compact-profile__follow">
					{ followCount ? (
						<div className="author-compact-profile__follow-count">
							{ this.props.translate( '%(followCount)s follower', '%(followCount)s followers', {
								count: followCount,
								args: {
									followCount: numberFormat( followCount ),
								},
							} ) }
						</div>
					) : null }

					{ followUrl && <ReaderFollowButton siteUrl={ followUrl } /> }
				</div>
			</div>
		);
	}
}

export default localize( AuthorCompactProfile );
