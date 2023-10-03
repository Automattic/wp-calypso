import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderPostEllipsisMenu from 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import TimeSince from 'calypso/components/time-since';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import { getSiteName } from 'calypso/reader/get-helpers';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import { getStreamUrl } from 'calypso/reader/route';
import { recordPermalinkClick } from 'calypso/reader/stats';

class PostByline extends Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		showSiteName: PropTypes.bool,
		showAvatar: PropTypes.bool,
		teams: PropTypes.array,
		showFollow: PropTypes.bool,
		compact: PropTypes.bool,
		openSuggestedFollows: PropTypes.func,
	};

	static defaultProps = {
		showAvatar: true,
	};

	constructor( props ) {
		super( props );
		this.secondaryBylineRef = createRef();
		this.organizeBullets = this.organizeBullets.bind( this );
	}

	/**
	 * Add functionality to this ref on mount and resize. Get all secondary items and bullets in
	 * the ref element. If lastItem.offsetTop !== thisItem.offsetTop, we can remove the bullet between
	 * them. If that bullet is on the line above (bullet.offsetTop === lastItem.offsetTop), we
	 * need to hide it and keep its spacing. If that bullet is on the next line instead, we can
	 * hide the bullet and its spacing (remove element entirely?).
	 */
	organizeBullets() {
		// Query all items in the secondary byline, as well as the bullets between them.
		const secondaryItems =
			this.secondaryBylineRef.current?.querySelectorAll(
				'.reader-post-card__byline-secondary-item'
			) || [];
		const bullets =
			this.secondaryBylineRef.current?.querySelectorAll(
				'.reader-post-card__byline-secondary-bullet'
			) || [];

		// Go through all the items to determine if the corresponding bullets should be shown.
		let lastItem;
		secondaryItems.forEach( ( item, index ) => {
			// We cant compare heights unless we have a lastItem set.
			if ( ! lastItem ) {
				lastItem = item;
				return;
			}
			// This should always exist given the elements below, but lets do a safe return if not.
			if ( ! bullets[ index - 1 ] ) {
				return;
			}

			// If the items arent at the same vertical position, hide the bullet.
			if ( item.offsetTop !== lastItem.offsetTop ) {
				// For now, hide it but keep spacing.
				bullets[ index - 1 ].style.visibility = 'hidden';

				// The below was an attempt to be more graceful than the line above. To keep the
				// spacing when hiding the bullet, only when the bullet is on line above. And to
				// hide it and remove its spacing when its not. This had a handful of edge case
				// issues where it did not work as expected.

				// // Check if the bullet is on the same line as above.
				// // Testing - difference of 4 when on same line, 17 when on next line.
				// if ( Math.abs( lastItem.offsetTop - bullets[ index - 1 ].offsetTop ) < 8 ) {
				// 	// If the bullet is on the line above, hide it but keep spacing
				// 	bullets[ index - 1 ].style.visibility = 'hidden';
				// } else {
				// 	// Otherwise, hide it completely.
				// 	bullets[ index - 1 ].style.display = 'none';
				// }
			} else {
				// If the items were on the same line, reset the style overrides.
				bullets[ index - 1 ].removeAttribute( 'style' );
			}
			// Prepare for next iteration.
			lastItem = item;
		} );
	}

	componentDidMount() {
		this.organizeBullets();
		window.addEventListener( 'resize', this.organizeBullets );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.organizeBullets );
	}

	componentDidUpdate() {
		this.organizeBullets();
	}

	recordDateClick = () => {
		recordPermalinkClick( 'timestamp_card', this.props.post );
	};

	recordStubClick = () => {
		recordPermalinkClick( 'stub_url_card', this.props.post );
	};

	render() {
		const { post, site, feed, showSiteName, showAvatar, teams, compact, openSuggestedFollows } =
			this.props;
		const feedId = feed ? feed.feed_ID : get( post, 'feed_ID' );
		const feedIcon = feed ? feed.site_icon ?? get( feed, 'image' ) : null;
		const siteId = get( site, 'ID' );
		const siteSlug = get( site, 'slug' );
		const siteUrl = get( site, 'URL' );
		const siteName = getSiteName( { site, feed, post } );
		const hasAuthorName = !! get( post, 'author.name', null );
		const hasMatchingAuthorAndSiteNames =
			hasAuthorName && areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );
		const shouldDisplayAuthor =
			hasAuthorName &&
			! isAuthorNameBlocked( post.author.name ) &&
			( ! hasMatchingAuthorAndSiteNames || ! showSiteName );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteIcon = get( site, 'icon.img' );

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="reader-post-card__byline ignore-click">
				{ showAvatar && (
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						author={ post.author }
						preferGravatar={ true }
						siteUrl={ streamUrl }
						isCompact={ true }
					/>
				) }
				<div className="reader-post-card__byline-details">
					{ showSiteName && ! compact && (
						<div className="reader-post-card__byline-site">
							<ReaderSiteStreamLink
								className="reader-post-card__site reader-post-card__link"
								feedId={ feedId }
								siteId={ siteId }
								post={ post }
							>
								{ siteName }
							</ReaderSiteStreamLink>
						</div>
					) }
					<div className="reader-post-card__author-and-timestamp">
						{ ( shouldDisplayAuthor || ( post.date && post.URL ) ) && (
							<span className="reader-post-card__byline-secondary" ref={ this.secondaryBylineRef }>
								{ shouldDisplayAuthor && (
									<>
										<ReaderAuthorLink
											// className="reader-post-card__link"
											className="reader-post-card__byline-secondary-item"
											author={ post.author }
											siteUrl={ streamUrl }
											post={ post }
										>
											{ post.author.name }
										</ReaderAuthorLink>
										{ post.date && post.URL && (
											<span className="reader-post-card__byline-secondary-bullet">·</span>
										) }
									</>
								) }
								{ post.date && post.URL && (
									<>
										<a
											className="reader-post-card__byline-secondary-item"
											onClick={ this.recordStubClick }
											href={ siteUrl }
											target="_blank"
											rel="noopener noreferrer"
										>
											{ /* Use the siteName if not showing it above, otherwise use the slug */ }
											{ ! showSiteName ? siteName : siteSlug }
										</a>
										<span className="reader-post-card__byline-secondary-bullet">·</span>
										<a
											className="reader-post-card__byline-secondary-item"
											onClick={ this.recordDateClick }
											href={ post.URL }
											target="_blank"
											rel="noopener noreferrer"
										>
											<TimeSince date={ post.date } />
										</a>
									</>
								) }
							</span>
						) }
					</div>
				</div>
				{ ! compact && (
					<ReaderPostEllipsisMenu
						site={ site }
						teams={ teams }
						post={ post }
						showFollow={ true }
						openSuggestedFollows={ openSuggestedFollows }
					/>
				) }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default PostByline;
