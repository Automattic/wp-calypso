/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import { getSiteName } from 'reader/get-helpers';

import { areEqualIgnoringWhitespaceAndCase } from './lib';

class PostByline extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isDiscoverPost: PropTypes.bool,
		showSiteName: PropTypes.bool,
		showAvatar: PropTypes.bool,
	};

	static defaultProps = {
		isDiscoverPost: false,
		showAvatar: true,
	};

	render() {
		const { post, site, feed, isDiscoverPost, showSiteName, showAvatar } = this.props;

		const siteName = getSiteName( { site, feed, post } );
		const hasAuthorName = !! get( post, 'author.name', null );
		const hasMatchingAuthorAndSiteNames =
			hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );
		const shouldDisplayAuthor =
			! isDiscoverPost &&
			hasAuthorName &&
			'admin' !== post.author.name.toLowerCase() &&
			( ! hasMatchingAuthorAndSiteNames || ! showSiteName );

		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="reader-post-card__byline ignore-click">
				{ showAvatar && (
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						author={ post.author }
						preferGravatar={ true }
						isCompact={ true }
					/>
				) }
				<div className="reader-post-card__byline-details">
					{ ( shouldDisplayAuthor || showSiteName ) && (
						<div className="reader-post-card__byline-author-site">
							{ shouldDisplayAuthor && <div>{ post.author }</div> }
							{ shouldDisplayAuthor && showSiteName ? ', ' : '' }
							{ showSiteName && <div>{ siteName }</div> }
						</div>
					) }
					<div className="reader-post-card__timestamp-and-tag"></div>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default PostByline;
