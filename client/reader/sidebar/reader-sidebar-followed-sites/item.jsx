/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderSidebarHelper from '../helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import Count from 'calypso/components/count';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { useDispatch } from 'react-redux';
import Favicon from 'calypso/reader/components/favicon';

/**
 * Style dependencies
 */
import '../style.scss';

const ReaderSidebarFollowingItem = ( props ) => {
	const { site, path } = props;
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
				'sidebar-dynamic-menu__blog': true,
			} ) }
		>
			<a
				className="sidebar__menu-link sidebar__menu-link-reader"
				href={ streamLink }
				onClick={ () => handleSidebarClick( site ) }
			>
				<Favicon site={ site } className="sidebar__menu-item-siteicon" size={ 18 } />

				<span className="sidebar__menu-item-sitename">
					{ site.name || formatUrlForDisplay( site.URL ) }
				</span>
				{ site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
			</a>
		</li>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default ReaderSidebarFollowingItem;
