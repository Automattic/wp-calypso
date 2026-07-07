import './style.scss';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
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

type ReaderSidebarSite = Pick<
	ReturnType< typeof useSubscribedSites >[ number ],
	'name' | 'URL'
> & {
	feed_URL?: string;
};

const isFreeWpcomSubdomain = ( host = '' ): boolean => /\.wordpress\.com$/i.test( host );

/**
 * Reddit subreddit/user feeds all resolve to the same generic `reddit.com`
 * domain, so a title-less subreddit reads best as its specific `r/name` (or
 * `u/name`) handle derived from the feed URL.
 */
function getRedditFeedLabel( feedUrl?: string ): string | undefined {
	const match = feedUrl?.match( /reddit\.com\/(r|user)\/([^/?#]+)/i );
	if ( ! match ) {
		return undefined;
	}

	const prefix = match[ 1 ].toLowerCase() === 'user' ? 'u' : 'r';
	return `${ prefix }/${ match[ 2 ] }`;
}

/**
 * Host-and-path label for a feed URL, without the protocol or a trailing feed
 * extension (e.g. `example.com/blog`). Used as a last resort so a subscription
 * that has not resolved a title or a site URL yet is not shown blank.
 */
function getGenericFeedLabel( feedUrl?: string ): string | undefined {
	if ( ! feedUrl ) {
		return undefined;
	}

	const withoutFeedExtension = feedUrl.replace(
		/\/?\.?(rss|rss\.xml|atom|atom\.xml|feed)\/?$/i,
		''
	);
	return formatUrlForDisplay( withoutFeedExtension ) || undefined;
}

/**
 * Best label for a followed site in the Reader sidebar. A real title always
 * wins. Otherwise: prefer a Reddit `r/subreddit` handle (the resolved domain is
 * an uninformative `reddit.com` for every subreddit), then the resolved site
 * domain, then any feed-URL-derived label — so a brand-new feed whose title is
 * still resolving server-side is never shown blank. Untitled WordPress.com
 * sites come back named after their free subdomain, so those still prefer the
 * mapped domain from `URL`.
 */
export function getReaderSidebarSiteName( site: ReaderSidebarSite ): string {
	const siteName = site.name ?? '';
	// `name` may be URL-shaped, so normalize before the subdomain check.
	const normalizedName = formatUrlForDisplay( siteName ) || siteName;

	if ( siteName && ! isFreeWpcomSubdomain( normalizedName ) ) {
		return siteName;
	}

	const feedUrl = site.feed_URL || site.URL;

	const redditLabel = getRedditFeedLabel( feedUrl );
	if ( redditLabel ) {
		return redditLabel;
	}

	const siteDomain = site.URL ? getSiteDomain( { site: { URL: site.URL } } ) : undefined;
	if ( siteDomain ) {
		return siteDomain;
	}

	return getGenericFeedLabel( feedUrl ) ?? siteName;
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
		trackMenuClick( null );
		page( '/reader' );
	};

	return (
		<ExpandableSidebarMenu
			onClick={ selectMenu }
			expanded={ isOpen }
			title={ translate( 'Recent' ) }
			disableFlyout
			className={ clsx( 'reader-sidebar-recent', className, {
				'sidebar__menu--selected': isRecentStream && ( ! isOpen || selectedSiteFeedId === null ),
			} ) }
			count={ undefined }
			icon={ null }
			materialIcon={ null }
			materialIconStyle={ null }
			expandableIconClick={ onClick }
		>
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
									{ site.last_updated && (
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
						<span>{ showAllSites ? translate( 'View less' ) : translate( 'View more' ) }</span>
					</MenuItemLink>
				</MenuItem>
			) }
		</ExpandableSidebarMenu>
	);
};

export default localize( ReaderSidebarRecent );
