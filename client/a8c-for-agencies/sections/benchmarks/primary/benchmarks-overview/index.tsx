import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
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
import BenchmarksForm from './benchmarks-form';

import './style.scss';

export default function BenchmarksOverview() {
	const title = __( 'Benchmarks' );
	const { quarter, year } = useMemo( () => getMostRecentPastQuarter(), [] );

	const { data: existingSubmission, isLoading } = useFetchAgencyBenchmark( quarter, year );

	return (
		<Layout className="benchmarks-overview" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				{ ! isLoading && existingSubmission && (
					<AlreadySubmitted quarter={ quarter } year={ year } />
				) }
				{ ! isLoading && ! existingSubmission && (
					<BenchmarksForm quarter={ quarter } year={ year } />
				) }
			</LayoutBody>
		</Layout>
	);
}
