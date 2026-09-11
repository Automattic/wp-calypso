import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMatch, useRouterState } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { useHelpCenter } from '../../app/help-center';
import { useLocale } from '../../app/locale';
import { siteOverviewRoute, siteRoute } from '../../app/router/sites';
import { getSitePlanUpgradeUrl } from '../../utils/site-url';
import { SiteExpiryNoticeBanner } from './banner';
import { isUrgentStage, useSiteExpiryNotice } from './use-site-expiry-notice';
import type { ReactNode } from 'react';

export interface SiteExpiryNoticeCandidate {
	node: ReactNode;
	/** Outranks the page's own notices: a week or less to go, or already lapsed. */
	isUrgent: boolean;
}

/**
 * The sitewide expiry notice as an arbiter candidate for whichever `/sites/*`
 * page is showing, or null off site pages and when there is nothing to say.
 * Eligibility is settled by `ensureSiteExpiryNoticeData` in the site route's
 * loader, so the answer is known on the page's first render.
 */
export function useSiteExpiryNoticeCandidate(): SiteExpiryNoticeCandidate | null {
	const siteMatch = useMatch( { from: siteRoute.id, shouldThrow: false } );
	const overviewMatch = useMatch( { from: siteOverviewRoute.id, shouldThrow: false } );
	const siteSlug = siteMatch?.params.siteSlug ?? '';
	const { data: site } = useQuery( { ...siteBySlugQuery( siteSlug ), enabled: siteSlug !== '' } );
	const { user } = useAuth();
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();
	const pathname = useRouterState( { select: ( routerState ) => routerState.location.pathname } );

	const state = useSiteExpiryNotice( site?.ID ?? 0, {
		isDashboardScreen: !! overviewMatch,
		currentUserId: user.ID,
		isAtomic: !! site?.is_wpcom_atomic,
		locale,
	} );

	const openSupport = useCallback(
		( message: string ) => {
			setNavigateToRoute( `/odie?query=${ encodeURIComponent( message ) }` );
			setShowHelpCenter( true );
		},
		[ setNavigateToRoute, setShowHelpCenter ]
	);

	if ( ! site || ! state ) {
		return null;
	}

	// `/sites/{slug}` is the overview; deeper paths name the page after the slug.
	const page = pathname.split( '/' )[ 3 ] || 'overview';

	return {
		isUrgent: isUrgentStage( state.stage ),
		node: (
			<SiteExpiryNoticeBanner
				siteId={ site.ID }
				state={ state }
				locale={ locale }
				surface="dashboard-site"
				eventProperties={ { page } }
				recordTracksEvent={ recordTracksEvent }
				onContactSupport={ openSupport }
				viewOtherPlansUrl={ getSitePlanUpgradeUrl( site ) }
			/>
		),
	};
}
