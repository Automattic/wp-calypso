/**
 * AmplifyPage
 *
 * Top-level page component for the Amplify section. Owns all modal state and
 * the list of in-progress jobs so both the modal flow and the reports table
 * stay in sync without prop-drilling through the router.
 *
 * Modal flow (two steps, both managed here):
 *   1. AmplifyAddSiteModal  — user picks which connected site to analyze
 *   2. AmplifyAnalysisModal — user picks analysis type, job is submitted
 *
 * Why state lives here (not inside the modals):
 *   AmplifyAddSiteModal and AmplifyAnalysisModal are siblings, not parent/child.
 *   If the analysis modal owned the site selection, closing the first modal would
 *   unmount it and lose the value before the second modal could use it.
 *
 * In-progress jobs:
 *   When a job is submitted, onAnalysisStarted fires and adds a PendingJob entry
 *   to `pendingJobs`. AmplifyReportsContent merges this list with reports fetched
 *   from R2, showing an "In progress" row immediately without waiting for the
 *   background task to finish and update the index.
 *   Pending jobs are persisted to sessionStorage so they survive a page reload
 *   within the same tab. On the next full load, real R2 data takes over and
 *   any completed jobs are dropped from the pending list.
 */

import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import AmplifyAddSiteModal from './amplify-add-site-modal';
import AmplifyAnalysisModal from './amplify-analysis-modal';
import AmplifyOverviewContent from './amplify-overview-content';
import AmplifyReportsContent from './amplify-reports-content';
import type { PendingJob } from './amplify-analysis-modal';
import type { ReactNode } from 'react';

export type AmplifyTab = 'overview' | 'reports';

type Props = {
	selectedTab: AmplifyTab;
};

// Pending jobs are persisted to sessionStorage under a key scoped to the
// (userId, agencyId) pair. Without per-identity scoping, a logout-then-
// login-as-different-user (or an agency switch) in the same tab would inherit
// the previous identity's in-flight site URLs and analysis types as ghost
// "in progress" rows in the new identity's reports table. Each pair gets its
// own bucket so a user switching back to a prior identity also recovers the
// pending jobs they had under that identity.
function buildPendingJobsKey( userId: number, agencyId: number ): string {
	return `amplify_pending_jobs_${ userId }_${ agencyId }`;
}

function isValidPendingJob( job: unknown ): job is PendingJob {
	if ( ! job || typeof job !== 'object' ) {
		return false;
	}
	const j = job as Record< string, unknown >;
	return (
		typeof j.jobId === 'string' &&
		typeof j.site === 'string' &&
		( j.type === 'human' || j.type === 'ai' || j.type === 'full' ) &&
		typeof j.startedAt === 'string'
	);
}

function loadPendingJobs( userId: number, agencyId: number ): PendingJob[] {
	// Guard against SSR where window/sessionStorage do not exist. A4A is
	// client-rendered today but this keeps the helper safe if that changes.
	if ( typeof window === 'undefined' ) {
		return [];
	}
	try {
		const stored = sessionStorage.getItem( buildPendingJobsKey( userId, agencyId ) );
		if ( ! stored ) {
			return [];
		}
		const parsed: unknown = JSON.parse( stored );
		return Array.isArray( parsed ) ? parsed.filter( isValidPendingJob ) : [];
	} catch {
		return [];
	}
}

function savePendingJobs( jobs: PendingJob[], userId: number, agencyId: number ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		sessionStorage.setItem( buildPendingJobsKey( userId, agencyId ), JSON.stringify( jobs ) );
	} catch {
		// sessionStorage unavailable — fail silently.
	}
}

export default function AmplifyPage( { selectedTab }: Props ) {
	const [ isSiteSelectOpen, setIsSiteSelectOpen ] = useState( false );
	const [ analysisFlowSite, setAnalysisFlowSite ] = useState< string | null >( null );
	// Pending jobs are loaded from a per-identity sessionStorage bucket — see
	// buildPendingJobsKey above. Initialize empty and let the effect below
	// rehydrate once the (userId, agencyId) pair is available.
	const [ pendingJobs, setPendingJobs ] = useState< PendingJob[] >( [] );

	// These come from Redux and are also used by the submit modal and reports
	// list to scope what gets sent and what gets shown. Reading them here lets
	// us scope the pending-jobs sessionStorage bucket the same way without
	// prop-drilling identity through the modal flow.
	const currentUserId = useSelector( getCurrentUserId );
	const activeAgencyId = useSelector( getActiveAgencyId );

	// Rehydrate the in-memory pending list whenever the active identity
	// changes. This swaps to the new (userId, agencyId) bucket on a user or
	// agency switch and clears to [] on logout (or before Redux state
	// hydrates), preventing the previous identity's in-flight rows from
	// leaking into the new identity's reports table.
	useEffect( () => {
		if ( ! currentUserId || ! activeAgencyId ) {
			setPendingJobs( [] );
			return;
		}
		setPendingJobs( loadPendingJobs( currentUserId, activeAgencyId ) );
	}, [ currentUserId, activeAgencyId ] );

	const handleSiteSelected = useCallback( ( url: string ) => {
		setIsSiteSelectOpen( false );
		setAnalysisFlowSite( url );
	}, [] );

	const handleAnalysisStarted = useCallback(
		( job: PendingJob ) => {
			// No-op if identity isn't ready yet. The submit modal applies the
			// same guard before calling startAmplifyAnalysis, so in practice
			// this is only reachable in a race we don't expect to hit.
			if ( ! currentUserId || ! activeAgencyId ) {
				return;
			}
			// Add the new job to the front of the pending list so it appears at the
			// top of the reports table immediately, and persist across page refreshes.
			setPendingJobs( ( prev ) => {
				const updated = [ job, ...prev ];
				savePendingJobs( updated, currentUserId, activeAgencyId );
				return updated;
			} );
		},
		[ currentUserId, activeAgencyId ]
	);

	const handlePendingJobsResolved = useCallback(
		( jobIds: string[] ) => {
			if ( ! currentUserId || ! activeAgencyId ) {
				return;
			}
			// AmplifyReportsContent calls this once it sees pending jobs that now have
			// a matching completed report in the R2 index. We drop those entries from
			// both state and sessionStorage so the pending list doesn't accumulate.
			// The reference-equality short-circuit avoids a wasteful re-render when
			// the callback fires with jobIds that have already been pruned.
			setPendingJobs( ( prev ) => {
				const remaining = prev.filter( ( job ) => ! jobIds.includes( job.jobId ) );
				if ( remaining.length === prev.length ) {
					return prev;
				}
				savePendingJobs( remaining, currentUserId, activeAgencyId );
				return remaining;
			} );
		},
		[ currentUserId, activeAgencyId ]
	);

	let title: string;
	let content: ReactNode;
	switch ( selectedTab ) {
		case 'overview':
			title = __( 'Amplify Overview' );
			content = <AmplifyOverviewContent onSiteSelected={ handleSiteSelected } />;
			break;
		case 'reports':
			title = __( 'Reports' );
			content = (
				<AmplifyReportsContent
					pendingJobs={ pendingJobs }
					onSiteSelected={ handleSiteSelected }
					onPendingJobsResolved={ handlePendingJobsResolved }
				/>
			);
			break;
	}

	const isReports = selectedTab === 'reports';

	return (
		<Layout
			title={ title }
			wide
			className={ clsx( 'amplify-layout', { 'full-width-layout-with-table': isReports } ) }
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => setIsSiteSelectOpen( true ) }
						>
							{ __( 'Amplify a site' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ content }</LayoutBody>

			{ isSiteSelectOpen && (
				<AmplifyAddSiteModal
					onClose={ () => setIsSiteSelectOpen( false ) }
					onSiteSelected={ handleSiteSelected }
				/>
			) }

			<AmplifyAnalysisModal
				site={ analysisFlowSite }
				onClose={ () => setAnalysisFlowSite( null ) }
				onAnalysisStarted={ handleAnalysisStarted }
			/>
		</Layout>
	);
}
