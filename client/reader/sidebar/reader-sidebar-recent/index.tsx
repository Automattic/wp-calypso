import './style.scss';
import page from '@automattic/calypso-router';
import { Count } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { useSubscribedFeedsInfo, useSubscribedSites } from 'calypso/reader/data/site-subscriptions';
import { getSiteDomain } from 'calypso/reader/get-helpers';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { MoreMenuActions } from 'calypso/reader/sidebar/more-menu-actions';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { getSelectedRecentFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import { AppState } from 'calypso/types';
import { MenuItem, MenuItemLink } from '../menu';

type Props = {
	isOpen: boolean;
	onClick: () => void;
	path: string;
	className: string;
};

const SITE_DISPLAY_CUTOFF = 5;
const RECENT_PATH_REGEX = /^\/reader(?:\/recent\/\d+)?\/?(?:\?|$)/;

type ReaderSidebarSite = Pick< ReturnType< typeof useSubscribedSites >[ number ], 'name' | 'URL' >;

const isFreeWpcomSubdomain = ( host = '' ): boolean => /\.wordpress\.com$/i.test( host );

/**
 * Label for a followed site: real title, else an `r/subreddit` handle, else the
 * resolved domain. Untitled WordPress.com sites come back named after their free
 * subdomain, so those fall through to the domain from `URL`.
 */
export function getReaderSidebarSiteName( site: ReaderSidebarSite ): string {
	const siteName = site.name ?? '';
	// `name` may be URL-shaped, so normalize before the subdomain check.
	const normalizedName = formatUrlForDisplay( siteName ) || siteName;

	if ( siteName && ! isFreeWpcomSubdomain( normalizedName ) ) {
		return siteName;
	}

	// A title-less subreddit reads best as its `r/name` (or `u/name`) handle, since
	// every subreddit resolves to the same generic `reddit.com` domain. The host is
	// anchored so only genuine `reddit.com` feeds qualify.
	const reddit = site.URL?.match( /^https?:\/\/(?:[^/]+\.)?reddit\.com\/(r|user)\/([^/?#]+)/i );
	if ( reddit ) {
		return `${ reddit[ 1 ].toLowerCase() === 'user' ? 'u' : 'r' }/${ reddit[ 2 ] }`;
	}

	const siteDomain = site.URL ? getSiteDomain( { site: { URL: site.URL } } ) : undefined;
	if ( siteDomain ) {
		return siteDomain;
	}

	return siteName;
}

const ReaderSidebarRecent = ( { isOpen, onClick, path, className }: Props ): React.JSX.Element => {
	const translate = useTranslate();
	const [ showAllSites, setShowAllSites ] = useState( false );
	const sites = useSubscribedSites();
	const feedsInfo = useSubscribedFeedsInfo();
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
		trackMenuClick( null );
		page( '/reader' );
	};

	return (
		<ExpandableSidebarMenu
			onClick={ selectMenu }
			expanded={ isOpen }
			title={ translate( 'Recent' ) }
			disableFlyout
			className={ clsx( 'reader-sidebar-recent', 'has-counts', className, {
				'sidebar__menu--selected': isRecentStream && ( ! isOpen || selectedSiteFeedId === null ),
			} ) }
			count={ feedsInfo.unseenCount > 0 ? feedsInfo.unseenCount : undefined }
			icon={ null }
			materialIcon={ null }
			materialIconStyle={ null }
			expandableIconClick={ onClick }
			moreMenuActions={
				<MoreMenuActions
					identifier="following"
					feedIds={ feedsInfo.feedIds }
					feedUrls={ feedsInfo.feedUrls }
					unseenCount={ feedsInfo.unseenCount }
				/>
			}
		>
			{ sitesToShow.map( ( site ) => {
				const displayName = getReaderSidebarSiteName( site );
				const unseenCount = site.unseen_count ?? 0;
				const unseenCountLabel = translate( '%(count)d unseen post', '%(count)d unseen posts', {
					count: unseenCount,
					args: { count: unseenCount },
					comment: '%(count)d is the number of unseen posts.',
				} );
				const feedId = site.feed_ID ? Number( site.feed_ID ) : null;

				return (
					<MenuItem key={ site.ID } selected={ isRecentStream && feedId === selectedSiteFeedId }>
						<AutoDirection>
							<MenuItemLink
								href={ `/reader/recent/${ feedId }` }
								className={ clsx( 'reader-sidebar-recent__item sidebar__menu-link' ) }
								onClick={ () => trackMenuClick( feedId ) }
							>
								<SiteIcon iconUrl={ site.site_icon } size={ 22 } />
								<span title={ displayName } className="sidebar__menu-item-sitename">
									<span>{ displayName }</span>
									{ site.last_updated && (
										<span className="sidebar__menu-item-last-updated">
											{ moment( new Date( site.last_updated ) ).fromNow() }
										</span>
									) }
								</span>
								<span className="sidebar__actions-and-count">
									{ feedId && site.feed_URL && (
										<MoreMenuActions
											identifier={ `feed:${ feedId }` }
											feedIds={ [ feedId ] }
											feedUrls={ [ site.feed_URL ] }
											unseenCount={ unseenCount }
										/>
									) }
									{ unseenCount > 0 && (
										<Count count={ unseenCount } compact aria-label={ unseenCountLabel } />
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
						<span>{ showAllSites ? translate( 'View less' ) : translate( 'View more' ) }</span>
					</MenuItemLink>
				</MenuItem>
			) }
		</ExpandableSidebarMenu>
	);
};

export default ReaderSidebarRecent;
