import { get, debounce } from 'lodash';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import ReaderPostEllipsisMenu from 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import TimeSince from 'calypso/components/time-since';
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
		this.debouncedOrganizeBullets = debounce( this.organizeBullets, 100 );
	}

	/**
	 * Goes through items in the secondary byline ref and compares their height to determine whether
	 * or not to hide the bullet separator.
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
				bullets[ index - 1 ].style.visibility = 'hidden';
			} else {
				// Otherwise, reset the inline style.
				bullets[ index - 1 ].removeAttribute( 'style' );
			}
			// Prepare for next iteration.
			lastItem = item;
		} );
	}

	componentDidMount() {
		this.organizeBullets();
		window.addEventListener( 'resize', this.debouncedOrganizeBullets );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.debouncedOrganizeBullets );
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
		const shouldDisplayAuthor = hasAuthorName && ! isAuthorNameBlocked( post.author.name );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteIcon = get( site, 'icon.img' );

		// Use the siteName if not showing it elsewhere, otherwise use the slug.
		const bylineSiteName = ! showSiteName ? siteName : siteSlug;
		const showDate = post.date && post.URL;

		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return (
			<div className="reader-post-card__byline ignore-click">
				{ showAvatar && (
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						author={ post.author }
						preferGravatar
						siteUrl={ streamUrl }
						isCompact
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
						{ ( shouldDisplayAuthor || bylineSiteName || showDate ) && (
							<span className="reader-post-card__byline-secondary" ref={ this.secondaryBylineRef }>
								{ shouldDisplayAuthor && (
									<>
										<ReaderAuthorLink
											className="reader-post-card__byline-secondary-item"
											author={ post.author }
											siteUrl={ streamUrl }
											post={ post }
										>
											{ post.author.name }
										</ReaderAuthorLink>
										{ ( bylineSiteName || showDate ) && (
											<span className="reader-post-card__byline-secondary-bullet-wrapper">
												<span className="reader-post-card__byline-secondary-bullet">·</span>
											</span>
										) }
									</>
								) }
								{ bylineSiteName && (
									<>
										<a
											className="reader-post-card__byline-secondary-item"
											onClick={ this.recordStubClick }
											href={ siteUrl }
											target="_blank"
											rel="noopener noreferrer"
										>
											{ bylineSiteName }
										</a>
										{ showDate && (
											<span className="reader-post-card__byline-secondary-bullet-wrapper">
												<span className="reader-post-card__byline-secondary-bullet">·</span>
											</span>
										) }
									</>
								) }
								{ showDate && (
									<a
										className="reader-post-card__byline-secondary-item"
										onClick={ this.recordDateClick }
										href={ post.URL }
										target="_blank"
										rel="noopener noreferrer"
									>
										<TimeSince date={ post.date } />
									</a>
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
						showFollow
						openSuggestedFollows={ openSuggestedFollows }
					/>
				) }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	}
}

export default PostByline;
