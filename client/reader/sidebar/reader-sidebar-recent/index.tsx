import './style.scss';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import Favicon from 'calypso/reader/components/favicon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import getReaderFollowedSites from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import { AppState } from 'calypso/types';
import { MenuItem, MenuItemLink } from '../menu';
// Not complete, just useful fields for now
type Site = {
	ID: number;
	URL: string;
	feed_URL: string;
	feed_ID: number;
	last_updated: number;
	is_owner: boolean;
	organization_id: number;
	name: string;
	unseen_count: number;
	site_icon: string | null;
	is_following: boolean;
};

type Props = {
	isOpen: boolean;
	onClick: () => void;
	path: string;
	className: string;
	translate: ( key: string ) => string;
};

const SITE_DISPLAY_CUTOFF = 8;
const RECENT_PATH_REGEX = /^\/reader(?:\/recent\/\d+)?\/?(?:\?|$)/;

const ReaderSidebarRecent = ( {
	translate,
	isOpen,
	onClick,
	path,
	className,
}: Props ): React.JSX.Element => {
	const [ showAllSites, setShowAllSites ] = useState( false );
	const sites = useSelector< AppState, Site[] >( getReaderFollowedSites );
	const selectedSiteFeedId = useSelector< AppState, number | null >( getSelectedRecentFeedId );
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const isRecentStream = RECENT_PATH_REGEX.test( path );

	let sitesToShow = showAllSites ? sites : sites.slice( 0, SITE_DISPLAY_CUTOFF );
	// const totalUnseenCount = sites.reduce( ( total, site ) => total + site.unseen_count, 0 );

	const selectedSite = sites.find( ( site ) => site.feed_ID === selectedSiteFeedId );
	if ( selectedSite && ! sitesToShow.includes( selectedSite ) ) {
		sitesToShow = [ ...sitesToShow, selectedSite ];
	}

	const shouldShowViewMoreButton =
		sites.length > SITE_DISPLAY_CUTOFF &&
		( showAllSites ||
			sitesToShow.length < sites.length ||
			sitesToShow[ sitesToShow.length - 1 ].feed_ID !== selectedSiteFeedId );

	const toggleShowAllSites = () => {
		setShowAllSites( ! showAllSites );
	};

	const trackMenuClick = ( feedId: number | null ) => {
		// Analytics.
		if ( feedId ) {
			recordAction( 'clicked_reader_sidebar_followed_single_site' );
			recordGaEvent( 'Clicked Reader Sidebar Followed Single Site' );
			recordReaderTracksEvent( 'calypso_reader_sidebar_followed_single_site_clicked' );
		} else {
			recordAction( 'clicked_reader_sidebar_followed_sites' );
			recordGaEvent( 'Clicked Reader Sidebar Followed Sites' );
			recordReaderTracksEvent( 'calypso_reader_sidebar_followed_sites_clicked' );
		}
	};

	const selectMenu = () => {
		if ( ! isOpen ) {
			onClick();
		}
		trackMenuClick( null );
		page( '/reader' );
	};

	return (
		<ExpandableSidebarMenu
			onClick={ selectMenu }
			expanded={ isOpen }
			title={ translate( 'Recent' ) }
			customIcon={ <ReaderIcon className="sidebar__menu-icon" viewBox="0 0 24 11" /> }
			disableFlyout
			className={ clsx( 'reader-sidebar-recent', className, {
				'sidebar__menu--selected': ! isOpen && isRecentStream,
			} ) }
			count={ undefined }
			icon={ null }
			materialIcon={ null }
			materialIconStyle={ null }
			expandableIconClick={ onClick }
		>
			<MenuItem key="all" selected={ isRecentStream && selectedSiteFeedId === null }>
				<MenuItemLink
					href="/reader"
					className="sidebar__menu-link all-sites-link"
					onClick={ () => trackMenuClick( null ) }
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						className="gridicon gridicons-globe reader-sidebar-recent__site-icon"
					>
						<path d="m10.845 14.116-6.736 6.936-1.521-1.478 6.673-6.871-9.086-.039.009-2.121 9.204.04-6.309-6.497L4.6 2.609l6.218 6.403-.046-8.84 2.121-.011.046 8.756 6.125-6.309 1.521 1.477-6.33 6.519 9.578.042-.009 2.121-9.399-.041 6.651 6.849-1.521 1.478-6.588-6.784.05 9.553-2.121.011z" />
					</svg>

					<span>{ translate( 'All' ) }</span>
				</MenuItemLink>
			</MenuItem>
			{ sitesToShow.map( ( site ) => (
				<MenuItem
					key={ site.ID }
					selected={ isRecentStream && site.feed_ID === selectedSiteFeedId }
				>
					<MenuItemLink
						href={ `/reader/recent/${ site.feed_ID }` }
						className={ clsx( 'reader-sidebar-recent__item sidebar__menu-link' ) }
						onClick={ () => trackMenuClick( site.feed_ID ) }
					>
						<Favicon site={ site } className="reader-sidebar-recent__site-icon" size={ 24 } />
						<span title={ site.name } className="reader-sidebar-recent__site-name">
							{ site.name }
						</span>
					</MenuItemLink>
				</MenuItem>
			) ) }
			{ shouldShowViewMoreButton && (
				<li>
					<button
						className="reader-sidebar-recent__item reader-sidebar-recent__item--without-icon reader-sidebar-recent__view-more"
						onClick={ toggleShowAllSites }
					>
						{ showAllSites ? translate( 'View Less' ) : translate( 'View More' ) }
					</button>
				</li>
			) }
		</ExpandableSidebarMenu>
	);
};

export default localize( ReaderSidebarRecent );
