import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchLicenseCounts from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
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

	const showEmptyStateContent = isFetched && data?.[ LicenseFilter.NotRevoked ] === 0;

	return (
		<Layout
			className="licenses-overview"
			title={ title }
			wide
			withBorder
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<PageViewTracker
				title="Purchases > Licenses"
				path="/purchases/licenses/:filter"
				properties={ { filter } }
			/>
			<LicensesOverviewContext.Provider value={ context }>
				<LayoutTop withNavigation>
					<LayoutHeader>
						<Title>{ title } </Title>
						<Actions>
							<Button
								disabled={ ! partnerCanIssueLicense }
								href={ partnerCanIssueLicense ? A4A_MARKETPLACE_LINK : undefined }
								onClick={ onIssueNewLicenseClick }
								primary
								style={ { marginLeft: 'auto' } }
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
