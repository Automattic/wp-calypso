import { getUrlParts } from '@automattic/calypso-url';
import { Card } from '@automattic/components';
import clsx from 'clsx';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import { get, forEach, uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { hasReaderFollowOrganization } from 'calypso/state/reader/follows/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/* eslint-disable wpcalypso/jsx-classname-namespace */
class CrossPost extends PureComponent {
	static propTypes = {
		post: PropTypes.object.isRequired,
		isSelected: PropTypes.bool.isRequired,
		xMetadata: PropTypes.object.isRequired,
		xPostedTo: PropTypes.array,
		handleClick: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		postKey: PropTypes.object,
		site: PropTypes.object,
		feed: PropTypes.object,
		isWPForTeamsItem: PropTypes.bool,
		currentRoute: PropTypes.string,
		hasOrganization: PropTypes.bool,
	};

	handleTitleClick = ( event ) => {
		// modified clicks should let the default action open a new tab/window
		if ( event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}
		event.preventDefault();
		this.props.handleClick( this.props.xMetadata );
	};

	handleCardClick = ( event ) => {
		const rootNode = ReactDom.findDOMNode( this );

		if ( closest( event.target, '.should-scroll', rootNode ) ) {
			setTimeout( function () {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		if ( closest( event.target, '.ignore-click', rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if (
			closest( event.target, 'a', rootNode ) &&
			closest( event.target, '.reader__x-post', rootNode )
		) {
			return;
		}

		// if the click has modifier, ignore it
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) {
			// some child handled it
			event.preventDefault();
			this.props.handleClick( this.props.xMetadata );
		}
	};

	getSiteNameFromURL = ( siteURL ) => {
		return siteURL && `+${ getUrlParts( siteURL ).hostname.split( '.' )[ 0 ] }`;
	};

	getDescription = ( authorFirstName ) => {
		let label;
		const siteName = this.getSiteNameFromURL( this.props.xMetadata.siteURL );
		const isCrossComment = !! this.props.xMetadata.commentURL;
		if ( isCrossComment ) {
			label = this.props.translate(
				'{{author}}%(authorFirstName)s{{/author}} {{label}}left a comment on %(siteName)s, cross-posted to{{/label}} {{blogNames/}}',
				{
					args: {
						siteName: siteName,
						authorFirstName: authorFirstName,
					},
					components: {
						author: <span className="reader__x-post-author" />,
						label: <span className="reader__x-post-label" />,
						blogNames: this.getXPostedToContent(),
					},
				}
			);
		} else {
			label = this.props.translate(
				'{{author}}%(authorFirstName)s{{/author}} {{label}}cross-posted from %(siteName)s to{{/label}} {{blogNames/}}',
				{
					args: {
						siteName: siteName,
						authorFirstName: authorFirstName,
					},
					components: {
						author: <span className="reader__x-post-author" />,
						label: <span className="reader__x-post-label" />,
						blogNames: this.getXPostedToContent(),
					},
				}
			);
		}
		return label;
	};

	getXPostedToContent = () => {
		const { postKey, translate } = this.props;

		const xPostedToList = [
			{
				siteURL: this.props.post.site_URL,
				siteName: this.getSiteNameFromURL( this.props.post.site_URL ),
			},
		];

		// Add any other x-post URLs we know about
		if ( postKey.xPostUrls ) {
			forEach( postKey.xPostUrls, ( xPostUrl ) => {
				xPostedToList.push( {
					siteURL: xPostUrl,
					siteName: this.getSiteNameFromURL( xPostUrl ),
				} );
			} );
		}

		return uniqBy( xPostedToList, 'siteName' ).map( ( xPostedTo, index, array ) => {
			return (
				<span className="reader__x-post-site" key={ xPostedTo.siteURL + '-' + index }>
					{ xPostedTo.siteName }
					{ index + 2 < array.length && <span>, </span> }
					{ index + 2 === array.length && (
						<span>
							{ ' ' }
							{ translate( 'and', {
								comment:
									'last conjunction in a list of blognames: (blog1, blog2,) blog3 _and_ blog4',
							} ) }{ ' ' }
						</span>
					) }
				</span>
			);
		} );
	};

	render() {
		const {
			post,
			postKey,
			site,
			feed,
			translate,
			currentRoute,
			hasOrganization,
			isWPForTeamsItem,
		} = this.props;
		const { blogId: siteId, feedId } = postKey;
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );

		let isSeen = false;
		if ( isEligibleForUnseen( { isWPForTeamsItem, currentRoute, hasOrganization } ) ) {
			isSeen = post?.is_seen;
		}
		const articleClasses = clsx( {
			reader__card: true,
			'is-x-post': true,
			'is-selected': this.props.isSelected,
			'is-seen': isSeen,
		} );

		// Remove the x-post text from the title.
		// TODO: maybe add xpost metadata, so we can remove this regex
		let xpostTitle = post.title;
		xpostTitle = xpostTitle.replace( /x-post:/i, '' );

		if ( ! xpostTitle ) {
			xpostTitle = `(${ translate( 'no title' ) })`;
		}

		return (
			<Card tagName="article" onClick={ this.handleCardClick } className={ articleClasses }>
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ post.author }
					onClick={ this.handleTitleClick }
					isCompact
				/>
				<div className="reader__x-post">
					{ post.title && (
						<h1 className="reader__post-title">
							<a
								className="reader__post-title-link"
								onClick={ this.handleTitleClick }
								href={ post.URL }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ xpostTitle }
							</a>
						</h1>
					) }
					{ post.author && this.getDescription( post.author.first_name ) }
				</div>
				{ feedId && <QueryReaderFeed feedId={ +feedId } /> }
				{ siteId && <QueryReaderSite siteId={ +siteId } /> }
			</Card>
		);
	}
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default connect( ( state, ownProps ) => {
	const { feedId, blogId } = ownProps.postKey;
	let feed;
	let site;
	if ( feedId ) {
		feed = getFeed( state, feedId );
		site = feed && feed.blog_ID ? getSite( state, feed.blog_ID ) : undefined;
	} else {
		site = getSite( state, blogId );
		feed = site && site.feed_ID ? getFeed( state, site.feed_ID ) : undefined;
	}
	return {
		currentRoute: getCurrentRoute( state ),
		isWPForTeamsItem: isSiteWPForTeams( state, blogId ) || isFeedWPForTeams( state, feedId ),
		hasOrganization: hasReaderFollowOrganization( state, feedId, blogId ),
		feed,
		site,
	};
} )( localize( CrossPost ) );
