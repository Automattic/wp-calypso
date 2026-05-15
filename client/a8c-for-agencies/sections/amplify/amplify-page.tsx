/**
 * AmplifyPage
 *
 * Top-level page component for the Amplify section. Owns all modal state and
 * the list of in-progress jobs so both the modal flow and the reports table
 * stay in sync without prop-drilling through the router.
 *
 * Modal flow (two steps, both managed here):
 *   1. AmplifyAddSiteModal  — user picks which connected site to analyse
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
import { useCallback, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
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

const PENDING_JOBS_KEY = 'amplify_pending_jobs';

function loadPendingJobs(): PendingJob[] {
	try {
		const stored = sessionStorage.getItem( PENDING_JOBS_KEY );
		return stored ? JSON.parse( stored ) : [];
	} catch {
		return [];
	}
}

function savePendingJobs( jobs: PendingJob[] ): void {
	try {
		sessionStorage.setItem( PENDING_JOBS_KEY, JSON.stringify( jobs ) );
	} catch {
		// sessionStorage unavailable — fail silently.
	}
}

export default function AmplifyPage( { selectedTab }: Props ) {
	const [ isSiteSelectOpen, setIsSiteSelectOpen ] = useState( false );
	const [ analysisFlowSite, setAnalysisFlowSite ] = useState< string | null >( null );
	const [ pendingJobs, setPendingJobs ] = useState< PendingJob[] >( loadPendingJobs );

	const handleSiteSelected = useCallback( ( url: string ) => {
		setIsSiteSelectOpen( false );
		setAnalysisFlowSite( url );
	}, [] );

	const handleAnalysisStarted = ( job: PendingJob ) => {
		// Add the new job to the front of the pending list so it appears at the
		// top of the reports table immediately, and persist across page refreshes.
		setPendingJobs( ( prev ) => {
			const updated = [ job, ...prev ];
			savePendingJobs( updated );
			return updated;
		} );
	};

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
				<AmplifyReportsContent pendingJobs={ pendingJobs } onSiteSelected={ handleSiteSelected } />
			);
			break;
	}

	const isReports = selectedTab === 'reports';

	return (
		<Layout
			title={ title }
			wide
			className={ clsx( { 'full-width-layout-with-table': isReports } ) }
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
