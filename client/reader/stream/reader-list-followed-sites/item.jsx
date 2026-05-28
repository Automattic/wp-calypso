import '../style.scss';
import { Count } from '@automattic/components';
import { get } from 'lodash';
import { connect, useDispatch, useSelector } from 'react-redux';
import { SiteIcon } from 'calypso/blocks/site-icon';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { getStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import ReaderSidebarHelper from '../../sidebar/helper';

const ReaderListFollowingItem = ( props ) => {
	const { site, path, isUnseen, follow, siteId } = props;
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { data: feed } = useFeedQuery( follow?.feed_ID );
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

	const streamLink = getStreamUrl( follow.feed_ID, follow.blog_ID );
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
					<SiteIcon iconUrl={ siteIcon || feedIcon } size={ 32 } />
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
		const siteId = get( ownProps.follow, 'blog_ID' );

		return {
			site: getSite( state, siteId ),
			siteId: siteId,
		};
	},
	{ registerLastActionRequiresLogin }
)( ReaderListFollowingItem );
