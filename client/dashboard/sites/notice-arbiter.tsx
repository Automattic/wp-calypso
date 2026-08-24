import { Children, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Shared candidates compete on every page that renders the arbiter. The pick
 * is latched on mount so that a preference change mid-session (e.g. dismissing
 * a welcome notice) empties the slot instead of promoting the next notice.
 */
function useSharedCandidate(): ReactNode {
	// If there were shared notices across all site pages, this is where they'd go.
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
 *
 * Candidates must be on-load banners: eligibility settled when the page
 * mounts. Notices that appear in response to a user action mid-session
 * (progress, action errors) break the on-mount latch below — render those as
 * siblings of the arbiter instead; they may stack with the arbiter's banner.
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
