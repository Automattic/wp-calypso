import { Children, useState } from 'react';
import { useSiteExpiryNoticeCandidate } from '../components/site-expiry-notice';
import type { ReactNode } from 'react';

/**
 * Shared candidates compete on every page that renders the arbiter. Today there
 * is one: the sitewide plan-expiry notice, null off `/sites/*` site pages.
 */
function useSharedCandidate(): { node: ReactNode; isUrgent: boolean } | null {
	return useSiteExpiryNoticeCandidate();
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
 * The first non-null child wins. Shared candidates live in the arbiter. An
 * urgent one (the plan-expiry notice within a week of expiry or past it)
 * wins over page candidates; any other shared candidate only fills an empty
 * slot. Candidates must not decide visibility inside their own render ("self-null");
 * the only sanctioned internal `return null` is an in-session dismissal,
 * which deliberately leaves the slot empty rather than showing the next
 * notice. See client/dashboard/sites/AGENTS.md.
 *
 * Candidates must be on-load banners: eligibility settled when the page
 * mounts. Notices that appear in response to a user action mid-session
 * (progress, action errors) break the on-mount latch below — render those as
 * siblings of the arbiter instead; they may stack with the arbiter's banner.
 */
export function SitesNoticeArbiter( { children }: { children?: ReactNode } ) {
	const sharedCandidate = useSharedCandidate();
	const pageCandidates = Children.toArray( children );

	// Latched: whichever tier held the slot when the page loaded keeps it. A
	// dismissal mid-session (a page notice self-nulling, or a shared candidate
	// whose hook goes null once the dismissal is written back) empties the slot
	// rather than promoting the next notice.
	const [ hadPageCandidateOnMount ] = useState( pageCandidates.length > 0 );
	const [ hadUrgentSharedCandidateOnMount ] = useState( !! sharedCandidate?.isUrgent );

	// The red tier: a site a week or less from losing its plan, or that already
	// has, hears about it before anything the page wants to say.
	if ( sharedCandidate?.isUrgent ) {
		return sharedCandidate.node;
	}

	if ( hadUrgentSharedCandidateOnMount ) {
		return null;
	}

	if ( pageCandidates.length > 0 ) {
		return pageCandidates[ 0 ];
	}

	if ( hadPageCandidateOnMount ) {
		return null;
	}

	return sharedCandidate?.node ?? null;
}
