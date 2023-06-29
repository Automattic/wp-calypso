import { get } from 'lodash';
import { connect, useDispatch } from 'react-redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import Count from 'calypso/components/count';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getReaderFollowForFeed } from 'calypso/state/reader/follows/selectors';
import ReaderSidebarHelper from '../../sidebar/helper';
import '../style.scss';

const ReaderListFollowingItem = ( props ) => {
	const { site, path, isUnseen, feed } = props;
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();
	const feedIcon = feed ? feed.site_icon ?? get( feed, 'image' ) : null;
	const siteIcon = site ? site.site_icon ?? get( site, 'icon.img' ) : null;

	const handleSidebarClick = ( selectedSite ) => {
		recordAction( 'clicked_reader_sidebar_following_item' );
		recordGaEvent( 'Clicked Reader Sidebar Following Item' );
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_sidebar_following_item_clicked', {
				blog: decodeURIComponent( selectedSite.URL ),
			} )
		);
	};

	let streamLink;

	if ( site.feed_ID ) {
		streamLink = `/read/feeds/${ site.feed_ID }`;
	} else if ( site.blog_ID ) {
		// If subscription is missing a feed ID, fallback to blog stream
		streamLink = `/read/blogs/${ site.blog_ID }`;
	} else {
		// Skip it
		return null;
	}

	const urlForDisplay = formatUrlForDisplay( site.URL );

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
				onClick={ () => handleSidebarClick( site ) }
			>
				<span className="reader-sidebar-site_siteicon">
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						preferGravatar={ true }
						isCompact={ true }
						iconSize={ 24 }
					/>
				</span>
				<span className="reader-sidebar-site_sitename">
					<span className="reader-sidebar-site_nameurl">{ site.name || urlForDisplay }</span>
					{ site.last_updated > 0 && (
						<span className="reader-sidebar-site_updated">
							{ moment( new Date( site.last_updated ) ).fromNow() }
						</span>
					) }
					{ site.description?.length > 0 && (
						<span className="reader-sidebar-site_description">{ site.description }</span>
					) }
					{ urlForDisplay.length > 0 && (
						<span className="reader-sidebar-site_url">{ urlForDisplay }</span>
					) }
				</span>
				{ isUnseen && site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
			</a>
		</li>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default connect( ( state, ownProps ) => {
	const site = ownProps.site;
	const feedId = get( site, 'feed_ID' );
	const feed = getFeed( state, feedId );

	// Add site icon to feed object so have icon for external feeds
	if ( feed ) {
		const follow = getReaderFollowForFeed( state, parseInt( feedId ) );
		feed.site_icon = follow?.site_icon;
	}

	return {
		feed: feed,
	};
} )( ReaderListFollowingItem );
