import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useFetchAgencyBenchmark from '../../hooks/use-fetch-agency-benchmark';
import useFetchAgencyBenchmarksList from '../../hooks/use-fetch-agency-benchmarks-list';
import useFetchBenchmarksConfig from '../../hooks/use-fetch-benchmarks-config';
import { enumerateQuarters } from '../../lib/enumerate-quarters';
import BenchmarksEmptyState from './empty-state';
import BenchmarksMissingQuarterState from './missing-quarter-state';
import QuarterSelector from './quarter-selector';
import BenchmarksReportState from './report-state';
import SubmissionBanner from './submission-banner';
import SubmissionModal from './submission-modal';
import type { Quarter } from '../../constants';

import './style.scss';

type ContentProps = {
	earliest: Quarter;
	latest: Quarter;
	title: string;
};

function BenchmarksOverviewContent( { earliest, latest, title }: ContentProps ) {
	const dispatch = useDispatch();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ selectedQuarter, setSelectedQuarter ] = useState< Quarter | null >( null );

	const quarterOptions = useMemo(
		() => enumerateQuarters( earliest, latest ),
		[ earliest, latest ]
	);
	const activeQuarter = selectedQuarter ?? latest;

	const { data: activeSubmission, isLoading: isActiveSubmissionLoading } = useFetchAgencyBenchmark(
		activeQuarter.quarter,
		activeQuarter.year
	);
	const { data: submissions, isLoading: isListLoading } = useFetchAgencyBenchmarksList();

	const hasSubmissions = !! submissions && submissions.length > 0;
	const hasNoSubmissions = ! isListLoading && submissions?.length === 0;
	const showQuarterSelector = hasSubmissions && quarterOptions.length > 1;
	const isContentReady = ! isListLoading && ! isActiveSubmissionLoading;
	const showEmptyState = isContentReady && ! activeSubmission;
	// Returning agencies get a "submit this quarter" nudge whenever the quarter they're viewing
	// has no submission; brand-new agencies see the empty-state CTA instead.
	const showBanner = isContentReady && hasSubmissions && ! activeSubmission;

	const handleQuarterChange = ( quarter: Quarter ) => {
		setSelectedQuarter( quarter );
		dispatch(
			recordTracksEvent( 'calypso_a4a_benchmarks_quarter_selected', {
				quarter: quarter.quarter,
				year: quarter.year,
			} )
		);
	};

	return (
		<>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						{ showQuarterSelector && (
							<QuarterSelector
								quarters={ quarterOptions }
								value={ activeQuarter }
								onChange={ handleQuarterChange }
							/>
						) }
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				{ showBanner && (
					<SubmissionBanner
						quarter={ activeQuarter.quarter }
						year={ activeQuarter.year }
						onSubmitClick={ () => setIsModalOpen( true ) }
					/>
				) }
				{ isContentReady && activeSubmission && (
					<BenchmarksReportState quarter={ activeQuarter } submission={ activeSubmission } />
				) }
				{ showEmptyState && hasNoSubmissions && (
					<BenchmarksEmptyState onSubmitClick={ () => setIsModalOpen( true ) } />
				) }
				{ showEmptyState && ! hasNoSubmissions && <BenchmarksMissingQuarterState /> }
			</LayoutBody>
			{ isModalOpen && (
				<SubmissionModal
					quarter={ activeQuarter.quarter }
					year={ activeQuarter.year }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
}

export default function BenchmarksOverview() {
	const title = __( 'Benchmarks' );
	const { data: config } = useFetchBenchmarksConfig();
	const submissionWindow = config?.submission_window;

	return (
		<Layout className="benchmarks-overview" title={ title } wide>
			{ submissionWindow ? (
				<BenchmarksOverviewContent
					earliest={ submissionWindow.earliest }
					latest={ submissionWindow.latest }
					title={ title }
				/>
			) : (
				<>
					<LayoutTop>
						<LayoutHeader>
							<Title>{ title }</Title>
							<Actions>
								<MobileSidebarNavigation />
							</Actions>
						</LayoutHeader>
					</LayoutTop>
					<LayoutBody>{ null }</LayoutBody>
				</>
			) }
		</Layout>
	);
}
