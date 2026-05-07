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
import useFetchAgencyBenchmark from '../../hooks/use-fetch-agency-benchmark';
import getMostRecentPastQuarter from '../../lib/get-most-recent-past-quarter';
import AlreadySubmitted from './already-submitted';
import SubmissionBanner from './submission-banner';
import SubmissionModal from './submission-modal';

import './style.scss';

export default function BenchmarksOverview() {
	const title = __( 'Benchmarks' );
	const { quarter, year } = useMemo( () => getMostRecentPastQuarter(), [] );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const { data: existingSubmission, isLoading } = useFetchAgencyBenchmark( quarter, year );

	const showBanner = ! isLoading && ! existingSubmission;
	const showAlreadySubmitted = ! isLoading && existingSubmission;

	return (
		<Layout className="benchmarks-overview" title={ title } wide>
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
			</LayoutBody>
			{ isModalOpen && (
				<SubmissionModal
					quarter={ quarter }
					year={ year }
					onClose={ () => setIsModalOpen( false ) }
				/>
			) }
		</Layout>
	);
}
