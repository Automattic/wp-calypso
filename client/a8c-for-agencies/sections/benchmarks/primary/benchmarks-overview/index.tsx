import { Notice } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
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
import { formatQuarterLong } from '../../lib/format-quarter';
import BenchmarksEmptyState from './empty-state';
import HowToReadCard from './how-to-read-card';
import PeerComparisonCard from './peer-comparison-card';
import QuarterSelector from './quarter-selector';
import BenchmarkStatsGrid from './stats-grid';
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
	const isActiveQuarterLatest =
		activeQuarter.quarter === latest.quarter && activeQuarter.year === latest.year;

	const { data: activeSubmission, isLoading: isActiveSubmissionLoading } = useFetchAgencyBenchmark(
		activeQuarter.quarter,
		activeQuarter.year
	);
	const { data: submissions, isLoading: isListLoading } = useFetchAgencyBenchmarksList();

	const hasSubmissions = !! submissions && submissions.length > 0;
	const hasNoSubmissions = ! isListLoading && submissions?.length === 0;
	const submittedForLatest = !! submissions?.some(
		( s ) => s.quarter === latest.quarter && s.year === latest.year
	);
	// Banner is a "you missed a quarter" nudge for the current reporting quarter; only
	// meaningful for agencies that have submitted at least once before.
	const showBanner = ! isListLoading && hasSubmissions && ! submittedForLatest;
	const showQuarterSelector = hasSubmissions && quarterOptions.length > 1;
	// When the agency picked a past quarter it never submitted, there is nothing to show; the
	// current reporting quarter is already covered by the submission banner above.
	const showMissingSubmissionNotice =
		hasSubmissions && ! isActiveSubmissionLoading && ! activeSubmission && ! isActiveQuarterLatest;

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
				{ hasNoSubmissions ? (
					<BenchmarksEmptyState onSubmitClick={ () => setIsModalOpen( true ) } />
				) : (
					<>
						{ showBanner && (
							<SubmissionBanner
								quarter={ latest.quarter }
								year={ latest.year }
								onSubmitClick={ () => setIsModalOpen( true ) }
							/>
						) }
						<HowToReadCard />
						{ showMissingSubmissionNotice ? (
							<Notice
								className="benchmarks-missing-submission-notice"
								status="info"
								isDismissible={ false }
							>
								{ sprintf(
									/* translators: %s: quarter label, e.g. "Q3 2024". */
									__( 'Your agency didn’t submit benchmarks for %s.' ),
									formatQuarterLong( activeQuarter )
								) }
							</Notice>
						) : (
							<>
								<BenchmarkStatsGrid quarter={ activeQuarter.quarter } year={ activeQuarter.year } />
								{ activeSubmission && (
									<PeerComparisonCard
										quarter={ activeQuarter.quarter }
										year={ activeQuarter.year }
										ownSubmission={ activeSubmission }
									/>
								) }
							</>
						) }
					</>
				) }
			</LayoutBody>
			{ isModalOpen && (
				<SubmissionModal
					quarter={ latest.quarter }
					year={ latest.year }
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
