import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { useHelpCenter } from '../../app/help-center';
import { useLocale } from '../../app/locale';
import { getSitePlanUpgradeUrl } from '../../utils/site-url';
import { SiteExpiryNoticeBanner } from './banner';
import { isUrgentStage, useSiteExpiryNotice } from './use-site-expiry-notice';
import type { SiteExpiryNoticeBannerProps } from './banner';
import type { ReactNode } from 'react';

/** `siteRoute`'s id in `app/router/sites`; every site page's route id starts with it. */
const SITE_ROUTE_ID = '/sites/$siteSlug';

export interface SiteExpiryNoticeCandidate {
	node: ReactNode;
	/** Outranks the page's own notices: a week or less to go, or already lapsed. */
	isUrgent: boolean;
}

/**
 * The sitewide expiry notice as an arbiter candidate, or null off site pages and
 * when there is nothing to say. Eligibility is settled by
 * `ensureSiteExpiryNoticeData` in the site route's loader, so the answer is
 * known on the page's first render.
 */
export function useSiteExpiryNoticeCandidate(): SiteExpiryNoticeCandidate | null {
	// The leaf match, not the route objects: it is free of the dashboard's
	// basePath, and it keeps this hook off `app/router/sites`, which every
	// site page test mocks and which lazy-loads the pages that mount the arbiter.
	const { routeId, siteSlug } = useRouterState( {
		select: ( routerState ) => {
			const leaf = routerState.matches.at( -1 );
			const params = ( leaf?.params ?? {} ) as { siteSlug?: string };
			return { routeId: leaf?.routeId ?? '', siteSlug: params.siteSlug ?? '' };
		},
	} );
	const page = getPageName( routeId );
	const { data: site } = useQuery( {
		...siteBySlugQuery( siteSlug ),
		enabled: page !== null && siteSlug !== '',
	} );
	const { user } = useAuth();
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const state = useSiteExpiryNotice( site?.ID ?? 0, {
		isDashboardScreen: page === 'overview',
		currentUserId: user.ID,
		isAtomic: !! site?.is_wpcom_atomic,
		locale,
	} );

	if ( page === null || ! site || ! state ) {
		return null;
	}

	return {
		isUrgent: isUrgentStage( state.stage ),
		node: (
			<CandidateBanner
				siteId={ site.ID }
				state={ state }
				locale={ locale }
				surface="dashboard-site"
				eventProperties={ { page } }
				recordTracksEvent={ recordTracksEvent }
				viewOtherPlansUrl={ getSitePlanUpgradeUrl( site ) }
			/>
		),
	};
}

/**
 * Wires the Help Center in only once a notice is showing: the arbiter calls the
 * candidate hook on every site page, and the Help Center store is not
 * registered everywhere the arbiter is.
 */
function CandidateBanner( props: Omit< SiteExpiryNoticeBannerProps, 'onContactSupport' > ) {
	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();
	const openSupport = ( message: string ) => {
		setNavigateToRoute( `/odie?query=${ encodeURIComponent( message ) }` );
		setShowHelpCenter( true );
	};
	return <SiteExpiryNoticeBanner { ...props } onContactSupport={ openSupport } />;
}

/**
 * Which site page an event came from: `overview` for `/sites/{slug}`, and the
 * first segment after the slug anywhere deeper.
 */
function getPageName( routeId: string ): string | null {
	if ( routeId !== SITE_ROUTE_ID && ! routeId.startsWith( SITE_ROUTE_ID + '/' ) ) {
		return null;
	}
	const withinSite = routeId.slice( SITE_ROUTE_ID.length );
	return withinSite.split( '/' ).filter( Boolean )[ 0 ] ?? 'overview';
}
