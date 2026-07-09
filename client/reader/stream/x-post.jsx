import { getUrlParts } from '@automattic/calypso-url';
import { Card } from '@automattic/components';
import { uniqBy } from '@automattic/js-utils';
import clsx from 'clsx';
import closest from 'component-closest';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import UserAvatar from 'calypso/blocks/user-avatar';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { useSite } from 'calypso/reader/data/site';
import { useHasSiteSubscriptionOrganization } from 'calypso/reader/data/site-subscriptions';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
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

	cardRef = createRef();

	// Merge the internal card ref with an optional `itemRef` from InfiniteList so the
	// parent list can measure this item's DOM node without `findDOMNode`.
	setCardRef = ( node ) => {
		this.cardRef.current = node;
		const { itemRef } = this.props;
		if ( typeof itemRef === 'function' ) {
			itemRef( node );
		} else if ( itemRef ) {
			itemRef.current = node;
		}
	};

	handleCardClick = ( event ) => {
		const rootNode = this.cardRef.current;

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
			postKey.xPostUrls.forEach( ( xPostUrl ) => {
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
		const { post, translate, currentRoute, hasOrganization, isWPForTeamsItem } = this.props;

		let isSeen = false;
		const isSeenEnabled = isEligibleForUnseen( {
			isWPForTeamsItem,
			currentRoute,
			hasOrganization,
		} );
		if ( isSeenEnabled ) {
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
			<Card
				ref={ this.setCardRef }
				tagName="article"
				onClick={ this.handleCardClick }
				className={ articleClasses }
			>
				<UserAvatar user={ post.author } size={ 40 } />

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
			</Card>
		);
	}
}
/* eslint-enable wpcalypso/jsx-classname-namespace */

const ConnectedCrossPost = connect( ( state, ownProps ) => {
	const { blogId } = ownProps.postKey;
	const feed = ownProps.feed;
	const site = ownProps.site;
	return {
		currentRoute: getCurrentRoute( state ),
		isWPForTeamsItem:
			isSiteWPForTeams( state, blogId ) ||
			( feed?.blog_ID ? isSiteWPForTeams( state, feed.blog_ID ) : false ) ||
			( site?.ID ? isSiteWPForTeams( state, site.ID ) : false ),
	};
} )( localize( CrossPost ) );

export default function CrossPostContainer( props ) {
	const { feedId, blogId } = props.postKey || {};
	const { data: feedFromKey } = useFeedQuery( feedId );
	const siteId = blogId || ( feedFromKey?.blog_ID !== 0 ? feedFromKey?.blog_ID : undefined );
	const { site } = useSite( siteId );
	const resolvedFeedId = feedId || site?.feed_ID;
	const { data: feedFromSite } = useFeedQuery( feedFromKey ? undefined : resolvedFeedId );
	const hasOrganization = useHasSiteSubscriptionOrganization( feedId, blogId );
	return (
		<ConnectedCrossPost
			{ ...props }
			site={ site }
			feed={ feedFromKey || feedFromSite }
			hasOrganization={ hasOrganization }
		/>
	);
}
