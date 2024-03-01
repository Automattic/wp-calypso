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
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import LicenseList from '../license-list';
import LicenseSearch from '../license-search';
import LicenseStateFilter from '../license-state-filter';
import LicensesOverviewContext from './context';
import EmptyState from './empty-state';
import type {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';

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
		// TODO: dispatch action to open issue license modal
	};

	const showEmptyStateContent = false; // FIXME: get this from state

	return (
		<Layout
			className="licenses-overview"
			title={ title }
			wide
			withBorder
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<PageViewTracker
				title="Partner Portal > Licenses"
				path="/partner-portal/licenses/:filter"
				properties={ { filter } }
			/>
			{ /*  TODO: <FETCH_LICENSES_HERE /> */ }
			<LicensesOverviewContext.Provider value={ context }>
				<LayoutTop>
					<LayoutHeader>
						<Title>{ title } </Title>
						<Actions>
							{ /* TODO: <SHOW_PARTNER_KEY_SELECTION_HERE /> */ }
							<Button
								disabled={ ! partnerCanIssueLicense }
								href={ partnerCanIssueLicense ? '/marketplace' : undefined }
								onClick={ onIssueNewLicenseClick }
								primary
								style={ { marginLeft: 'auto' } }
							>
								{ translate( 'Issue New License' ) }
							</Button>
						</Actions>
					</LayoutHeader>

					<LicenseStateFilter />
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
