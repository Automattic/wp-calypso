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
import useFetchBenchmarksConfig from '../../hooks/use-fetch-benchmarks-config';
import AlreadySubmitted from './already-submitted';
import PeerComparisonExample from './peer-comparison-example';
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
	const { data: existingSubmission, isLoading } = useFetchAgencyBenchmark( quarter, year );

	const showBanner = ! isLoading && ! existingSubmission;
	const showAlreadySubmitted = ! isLoading && existingSubmission;

	return (
		<>
			<LayoutTop>
				{ showBanner && (
					<SubmissionBanner
						quarter={ quarter }
						year={ year }
						onSubmitClick={ () => setIsModalOpen( true ) }
					/>
				) }
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				{ showAlreadySubmitted && <AlreadySubmitted quarter={ quarter } year={ year } /> }
				{ ! isLoading && <PeerComparisonExample /> }
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
