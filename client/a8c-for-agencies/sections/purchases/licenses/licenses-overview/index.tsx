import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PressableUsageLimitNotice from 'calypso/a8c-for-agencies/components/pressable-usage-limit-notice';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchLicenseCounts from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LicenseList from '../license-list';
import LicenseSearch from '../license-search';
import LicenseStateFilter from '../license-state-filter';
import LicensesOverviewContext from './context';
import EmptyState from './empty-state';

import './style.scss';

interface Props {
	filter: LicenseFilter;
	search: string;
	currentPage: number;
	sortField: LicenseSortField;
	sortDirection: LicenseSortDirection;
}

export default function LicensesOverview( {
	filter,
	search,
	currentPage,
	sortDirection,
	sortField,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Licenses' );

	const context = {
		filter,
		search,
		currentPage,
		sortDirection,
		sortField,
	};

	const partnerCanIssueLicense = true; // FIXME: get this from state

	const onIssueNewLicenseClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_license_list_issue_license_click' ) );
	};

	const { data, isFetched } = useFetchLicenseCounts();

	const showEmptyStateContent = isFetched && data?.all === 0;

	return (
		<Layout className="licenses-overview" title={ title } wide withBorder>
			<LicensesOverviewContext.Provider value={ context }>
				<LayoutTop withNavigation>
					<PressableUsageLimitNotice />
					<LayoutHeader>
						<Title>{ title } </Title>
						<Actions className="a4a-licenses__header-actions">
							<MobileSidebarNavigation />
							<Button
								disabled={ ! partnerCanIssueLicense }
								href={ partnerCanIssueLicense ? A4A_MARKETPLACE_LINK : undefined }
								onClick={ onIssueNewLicenseClick }
								primary
							>
								{ translate( 'Issue New License' ) }
							</Button>
						</Actions>
					</LayoutHeader>

					<LicenseStateFilter data={ data } />
				</LayoutTop>

				<LayoutBody>
					{ showEmptyStateContent ? (
						<EmptyState />
					) : (
						<>
							<LicenseSearch />
							<LicenseList />
						</>
					) }
				</LayoutBody>
			</LicensesOverviewContext.Provider>
		</Layout>
	);
}
