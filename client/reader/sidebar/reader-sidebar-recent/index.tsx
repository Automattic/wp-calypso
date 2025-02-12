import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import Favicon from 'calypso/reader/components/favicon';
import ReaderFollowingIcon from 'calypso/reader/components/icons/following-icon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import getReaderFollowedSites from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import { selectSidebarRecentSite } from 'calypso/state/reader-ui/sidebar/actions';
import { AppState } from 'calypso/types';

import './style.scss';

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
const RECENT_PATH_REGEX = /^\/reader\/?(?:\?|$)/;

const ReaderSidebarRecent = ( {
	translate,
	isOpen,
	onClick,
	path,
	className,
}: Props ): React.JSX.Element => {
	const [ showAllSites, setShowAllSites ] = useState( false );
	const sites = useSelector< AppState, Site[] >( getReaderFollowedSites );
	const selectedSiteFeedId = useSelector< AppState, number >(
		( state ) => state.readerUi.sidebar.selectedRecentSite
	);
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const dispatch = useDispatch();

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

	const selectSite = ( feedId: number | null ) => {
		dispatch( selectSidebarRecentSite( { feedId } ) );
		if ( ! RECENT_PATH_REGEX.test( path ) ) {
			page( '/reader' );
		}

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

	return (
		<ExpandableSidebarMenu
			expanded={ isOpen }
			title={ translate( 'Recent' ) }
			onClick={ onClick }
			customIcon={ <ReaderFollowingIcon viewBox="-3 0 24 24" /> }
			disableFlyout
			className={ clsx( 'reader-sidebar-recent', className, {
				'sidebar__menu--selected': ! isOpen && RECENT_PATH_REGEX.test( path ),
			} ) }
			count={ undefined }
			icon={ null }
			materialIcon={ null }
			materialIconStyle={ null }
		>
			<li>
				<button
					className={ clsx(
						'reader-sidebar-recent__item reader-sidebar-recent__item--without-icon',
						{
							'reader-sidebar-recent__item--selected': selectedSiteFeedId === null,
						}
					) }
					onClick={ () => selectSite( null ) }
				>
					<span className="reader-sidebar-recent__site-name">{ translate( 'All' ) }</span>
					{ /* <span className="reader-sidebar-recent__site-count">{ totalUnseenCount }</span> */ }
				</button>
			</li>
			{ sitesToShow.map( ( site ) => (
				<li key={ site.ID }>
					<button
						className={ clsx( 'reader-sidebar-recent__item', {
							'reader-sidebar-recent__item--selected': site.feed_ID === selectedSiteFeedId,
						} ) }
						onClick={ () => selectSite( site.feed_ID ) }
					>
						<Favicon site={ site } className="reader-sidebar-recent__site-icon" size={ 16 } />
						<span title={ site.name } className="reader-sidebar-recent__site-name">
							{ site.name }
						</span>
						{ /* <span className="reader-sidebar-recent__site-count">{ site.unseen_count }</span> */ }
					</button>
				</li>
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
