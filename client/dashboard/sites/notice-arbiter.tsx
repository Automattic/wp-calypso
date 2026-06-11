import { useRouterState } from '@tanstack/react-router';
import { Children, useState } from 'react';
import OptInSurvey, { useShouldShowOptInSurvey } from '../components/opt-in-survey';
import { OptInWelcome, useShouldShowOptInWelcome } from '../components/opt-in-welcome';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import type { ReactNode } from 'react';

/**
 * Derive a Tracks `context` string from the deepest matched route, e.g.
 * `/sites` → 'sites', `/sites/$siteSlug/` → 'site-overview',
 * `/sites/$siteSlug/logs/php` → 'site-logs-php'.
 */
function useTracksContext(): string {
	const routeId = useRouterState( {
		select: ( state ) => String( state.matches.at( -1 )?.routeId ?? '' ),
	} );
	const sitePrefix = '/sites/$siteSlug';
	if ( routeId.startsWith( sitePrefix ) ) {
		const rest = routeId.slice( sitePrefix.length ).split( '/' ).filter( Boolean ).join( '-' );
		return rest ? `site-${ rest }` : 'site-overview';
	}
	return routeId.split( '/' ).filter( Boolean ).join( '-' ) || 'sites';
}

/**
 * Shared candidates compete on every page that renders the arbiter. The pick
 * is latched on mount so that a preference change mid-session (e.g. dismissing
 * the welcome notice) empties the slot instead of promoting the next notice.
 */
function useSharedCandidate(): ReactNode {
	const tracksContext = useTracksContext();
	const shouldShowOptInWelcome = useShouldShowOptInWelcome();
	const shouldShowOptInSurvey = useShouldShowOptInSurvey();

	const [ pick ] = useState( () => {
		if ( isDashboardBackport() ) {
			// Engagement prompts should not appear in the backported dashboard.
			return null;
		}
		if ( shouldShowOptInWelcome ) {
			return 'welcome';
		}
		if ( shouldShowOptInSurvey ) {
			return 'survey';
		}
		return null;
	} );

	if ( pick === 'welcome' ) {
		return <OptInWelcome tracksContext={ tracksContext } />;
	}
	if ( pick === 'survey' ) {
		return <OptInSurvey tracksContext={ tracksContext } />;
	}
	return null;
}

/**
 * Decides which single notice is visible at the top of a `/sites/*` page.
 *
 * Pages pass their page-specific notices as children, ordered by priority,
 * with eligibility decided at the call site:
 *
 *     <PageLayout
 *         notices={
 *             <SitesNoticeArbiter>
 *                 { isUrgent && <UrgentNotice /> }
 *                 { isRelevant && <RelevantNotice /> }
 *             </SitesNoticeArbiter>
 *         }
 *     >
 *
 * The first non-null child wins. If no page candidate is eligible, the
 * arbiter falls back to its own shared candidates (engagement prompts).
 * Candidates must not decide visibility inside their own render ("self-null");
 * the only sanctioned internal `return null` is an in-session dismissal,
 * which deliberately leaves the slot empty rather than showing the next
 * notice. See client/dashboard/sites/AGENTS.md.
 */
export function SitesNoticeArbiter( { children }: { children?: ReactNode } ) {
	const sharedCandidate = useSharedCandidate();
	const pageCandidates = Children.toArray( children );

	// Latched: if the page had a candidate when it loaded, never promote a
	// shared candidate into the slot mid-session (e.g. after a dismissal).
	const [ hadPageCandidateOnMount ] = useState( pageCandidates.length > 0 );

	if ( pageCandidates.length > 0 ) {
		return <>{ pageCandidates[ 0 ] }</>;
	}

	if ( hadPageCandidateOnMount ) {
		return null;
	}

	return <>{ sharedCandidate }</>;
}
