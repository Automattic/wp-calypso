import './style.scss';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { useSubscribedSites } from 'calypso/reader/data/site-subscriptions';
import { getSiteDomain } from 'calypso/reader/get-helpers';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import { AppState } from 'calypso/types';
import { AllIcon } from '../icons/all';
import { MenuItem, MenuItemLink } from '../menu';

type Props = {
	isOpen: boolean;
	onClick: () => void;
	path: string;
	className: string;
	translate: ( key: string ) => string;
};

const SITE_DISPLAY_CUTOFF = 5;
const RECENT_PATH_REGEX = /^\/reader(?:\/recent\/\d+)?\/?(?:\?|$)/;

type ReaderSidebarSite = Pick< ReturnType< typeof useSubscribedSites >[ number ], 'name' | 'URL' >;

const isFreeWpcomSubdomain = ( host = '' ): boolean => /\.wordpress\.com$/i.test( host );

/**
 * Best label for a followed site in the Reader sidebar. Untitled sites are
 * named after their free WordPress.com subdomain (with a trailing slash), so
 * prefer the real domain from `URL` in that case.
 */
export function getReaderSidebarSiteName( site: ReaderSidebarSite ): string {
	const siteDomain = site.URL ? getSiteDomain( { site: { URL: site.URL } } ) : undefined;
	const siteName = site.name ?? '';
	// `name` may be URL-shaped, so normalize before the subdomain check.
	const normalizedName = formatUrlForDisplay( siteName ) || siteName;

	if ( ( ! siteName || isFreeWpcomSubdomain( normalizedName ) ) && siteDomain ) {
		return siteDomain;
	}

	return siteName;
}

const ReaderSidebarRecent = ( {
	translate,
	isOpen,
	onClick,
	path,
	className,
}: Props ): React.JSX.Element => {
	const [ showAllSites, setShowAllSites ] = useState( false );
	const sites = useSubscribedSites();
	const selectedSiteFeedId = useSelector< AppState, number | null >( getSelectedRecentFeedId );
	const moment = useLocalizedMoment();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const isRecentStream = RECENT_PATH_REGEX.test( path );

	let sitesToShow = showAllSites ? sites : sites.slice( 0, SITE_DISPLAY_CUTOFF );

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
					<AllIcon />
					<span>{ translate( 'All' ) }</span>
				</MenuItemLink>
			</MenuItem>

			{ sitesToShow.map( ( site ) => {
				const displayName = getReaderSidebarSiteName( site );

				return (
					<MenuItem
						key={ site.ID }
						selected={ isRecentStream && site.feed_ID === selectedSiteFeedId }
					>
						<AutoDirection>
							<MenuItemLink
								href={ `/reader/recent/${ site.feed_ID }` }
								className={ clsx( 'reader-sidebar-recent__item sidebar__menu-link' ) }
								onClick={ () =>
									trackMenuClick( site.feed_ID == null ? null : Number( site.feed_ID ) )
								}
							>
								<SiteIcon iconUrl={ site.site_icon } size={ 22 } />
								<span title={ displayName } className="sidebar__menu-item-sitename">
									<span>{ displayName }</span>
									{ typeof site.last_updated === 'number' && site.last_updated > 0 && (
										<span className="sidebar__menu-item-last-updated">
											{ moment( new Date( site.last_updated ) ).fromNow() }
										</span>
									) }
								</span>
							</MenuItemLink>
						</AutoDirection>
					</MenuItem>
				);
			} ) }
			{ shouldShowViewMoreButton && (
				<MenuItem selected={ showAllSites }>
					<MenuItemLink className="view-more-link" onClick={ toggleShowAllSites }>
						<span>{ showAllSites ? translate( 'View Less' ) : translate( 'View More' ) }</span>
					</MenuItemLink>
				</MenuItem>
			) }
		</ExpandableSidebarMenu>
	);
};

export default localize( ReaderSidebarRecent );
