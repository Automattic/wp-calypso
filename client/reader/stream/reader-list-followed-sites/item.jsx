import { useDispatch } from 'react-redux';
import Count from 'calypso/components/count';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Favicon from 'calypso/reader/components/favicon';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../../sidebar/helper';
import '../style.scss';

const ReaderListFollowingItem = ( props ) => {
	const { site, path, isUnseen } = props;
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

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
					<Favicon site={ site } size={ 32 } />
				</span>
				<span className="reader-sidebar-site_sitename">
					<span className="reader-sidebar-site_nameurl">
						{ site.name || formatUrlForDisplay( site.URL ) }
					</span>
					<span className="reader-sidebar-site_updated">
						{ site.last_updated > 0 && moment( new Date( site.last_updated ) ).fromNow() }
					</span>
				</span>
				{ isUnseen && site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
			</a>
		</li>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default ReaderListFollowingItem;
