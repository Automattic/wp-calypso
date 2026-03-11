import { Count } from '@automattic/components';
import { get } from 'lodash';
import { connect, useDispatch, useSelector } from 'react-redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import ReaderSidebarHelper from '../../sidebar/helper';
import '../style.scss';

const ReaderListFollowingItem = ( props ) => {
	const { site, path, isUnseen, feed, follow, siteId } = props;
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const siteIcon = site ? site.site_icon ?? get( site, 'icon.img' ) : null;
	let feedIcon = get( follow, 'site_icon' );

	if ( ! follow ) {
		return null;
	}

	// If feed available, check feed for feed icon
	if ( feed && feed.image ) {
		feedIcon = get( feed, 'image' );
	}

	const handleSidebarClick = ( event, streamLink ) => {
		recordAction( 'clicked_reader_sidebar_following_item' );
		recordGaEvent( 'Clicked Reader Sidebar Following Item' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_following_item_clicked', {
				blog: decodeURIComponent( follow?.URL ),
			} )
		);
		if ( ! isLoggedIn ) {
			event.preventDefault();
			return props.registerLastActionRequiresLogin( {
				type: 'sidebar-link',
				redirectTo: streamLink,
			} );
		}
	};

	let streamLink;

	if ( follow.feed_ID ) {
		streamLink = `/reader/feeds/${ follow.feed_ID }`;
	} else if ( follow.blog_ID ) {
		// If subscription is missing a feed ID, fallback to blog stream
		streamLink = `/reader/blogs/${ follow.blog_ID }`;
	} else {
		// Skip it
		return null;
	}

	const urlForDisplay = formatUrlForDisplay( follow.URL );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<li
			key={ props.title }
			className={ ReaderSidebarHelper.itemLinkClass( streamLink, path, {
				'reader-sidebar-site': true,
			} ) }
		>
			<a
				className="reader-sidebar-site_link"
				href={ streamLink }
				onClick={ ( event ) => handleSidebarClick( event, streamLink ) }
			>
				<span className="reader-sidebar-site_siteicon">
					{ ! siteIcon && ! feedIcon && ! site && <QueryReaderSite siteId={ siteId } /> }
					{ ! siteIcon && ! feedIcon && ! feed && follow.feed_ID && (
						<QueryReaderFeed feedId={ follow.feed_ID } />
					) }
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						preferGravatar
						isCompact
						iconSize={ 32 }
					/>
				</span>
				<span className="reader-sidebar-site_sitename">
					<span className="reader-sidebar-site_nameurl">{ follow.name || urlForDisplay }</span>
					{ follow.last_updated > 0 && (
						<span className="reader-sidebar-site_updated">
							{ moment( new Date( follow.last_updated ) ).fromNow() }
						</span>
					) }
					{ follow.description?.length > 0 && (
						<span className="reader-sidebar-site_description">{ follow.description }</span>
					) }
					{ urlForDisplay?.length > 0 && (
						<span className="reader-sidebar-site_url">{ urlForDisplay }</span>
					) }
				</span>
				{ isUnseen && follow.unseen_count > 0 && <Count count={ follow.unseen_count } compact /> }
			</a>
		</li>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default connect(
	( state, ownProps ) => {
		const feedId = get( ownProps.follow, 'feed_ID' );
		const siteId = get( ownProps.follow, 'blog_ID' );

		return {
			feed: getFeed( state, feedId ),
			site: getSite( state, siteId ),
			siteId: siteId,
		};
	},
	{ registerLastActionRequiresLogin }
)( ReaderListFollowingItem );
