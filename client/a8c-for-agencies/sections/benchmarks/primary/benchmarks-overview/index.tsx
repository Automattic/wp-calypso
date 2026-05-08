import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import useFetchAgencyBenchmark from '../../hooks/use-fetch-agency-benchmark';
import useFetchAgencyBenchmarksList from '../../hooks/use-fetch-agency-benchmarks-list';
import useFetchBenchmarksConfig from '../../hooks/use-fetch-benchmarks-config';
import BenchmarksEmptyState from './empty-state';
import HowToReadCard from './how-to-read-card';
import BenchmarkStatsGrid from './stats-grid';
import SubmissionBanner from './submission-banner';
import SubmissionModal from './submission-modal';

import './style.scss';

type ContentProps = {
	quarter: 1 | 2 | 3 | 4;
	year: number;
	title: string;
};

function BenchmarksOverviewContent( { quarter, year, title }: ContentProps ) {
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const { data: existingSubmission, isLoading: isLatestLoading } = useFetchAgencyBenchmark(
		quarter,
		year
	);
	const { data: submissions, isLoading: isListLoading } = useFetchAgencyBenchmarksList();

	const hasNoSubmissions = ! isListLoading && submissions?.length === 0;
	// Banner is a "you missed a quarter" nudge; only meaningful for agencies that have submitted at least once before.
	const showBanner =
		! isLatestLoading &&
		! isListLoading &&
		!! submissions &&
		submissions.length > 0 &&
		! existingSubmission;

	return (
		<>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
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
								quarter={ quarter }
								year={ year }
								onSubmitClick={ () => setIsModalOpen( true ) }
							/>
						) }
						<HowToReadCard />
						<BenchmarkStatsGrid />
					</>
				) }
			</LayoutBody>
			{ isModalOpen && (
				<SubmissionModal
					quarter={ quarter }
					year={ year }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</>
	);
}

export default function BenchmarksOverview() {
	const title = __( 'Benchmarks' );
	const { data: config } = useFetchBenchmarksConfig();
	const latest = config?.submission_window.latest;

	return (
		<Layout className="benchmarks-overview" title={ title } wide>
			{ latest ? (
				<BenchmarksOverviewContent
					quarter={ latest.quarter }
					year={ latest.year }
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
