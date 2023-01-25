import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPartnerPortalLicenseCounts from 'calypso/components/data/query-jetpack-partner-portal-license-counts';
import Main from 'calypso/components/main';
import SiteAddLicenseNotification from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-add-license-notification';
import SiteWelcomeBanner from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-welcome-banner';
import LicenseList from 'calypso/jetpack-cloud/sections/partner-portal/license-list';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import LicenseStateFilter from 'calypso/jetpack-cloud/sections/partner-portal/license-state-filter';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getLicenseCounts,
	hasFetchedLicenseCounts,
} from 'calypso/state/partner-portal/licenses/selectors';
import { showAgencyDashboard } from 'calypso/state/partner-portal/partner/selectors';
import OnboardingWidget from '../onboarding-widget';

import './style.scss';

interface Props {
	filter: LicenseFilter;
	search: string;
	currentPage: number;
	sortField: LicenseSortField;
	sortDirection: LicenseSortDirection;
}

export default function Licenses( {
	filter,
	search,
	currentPage,
	sortDirection,
	sortField,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isAgencyUser = useSelector( showAgencyDashboard );
	const counts = useSelector( getLicenseCounts );
	const hasFetched = useSelector( hasFetchedLicenseCounts );
	const allLicensesCount = counts[ 'all' ];

	const context = {
		filter,
		search,
		currentPage,
		sortDirection,
		sortField,
	};

	const onIssueNewLicenseClick = () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_list_issue_license_click' ) );
	};

	const showEmptyStateContent = hasFetched && allLicensesCount === 0;

	return (
		<Main wideLayout className="licenses">
			<QueryJetpackPartnerPortalLicenseCounts />
			<DocumentHead title={ translate( 'Licenses' ) } />
			<SidebarNavigation />
			{ isAgencyUser && <SiteWelcomeBanner bannerKey="licenses-page" /> }
			<SiteAddLicenseNotification />
			<div className="licenses__header">
				<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>

				<SelectPartnerKeyDropdown />

				<Button
					href="/partner-portal/issue-license"
					onClick={ onIssueNewLicenseClick }
					primary={ ! showEmptyStateContent }
					style={ { marginLeft: 'auto' } }
				>
					{ translate( 'Issue New License' ) }
				</Button>
			</div>

			{ showEmptyStateContent ? (
				<OnboardingWidget isLicensesPage />
			) : (
				<LicenseListContext.Provider value={ context }>
					<LicenseStateFilter />

					<LicenseList />
				</LicenseListContext.Provider>
			) }
		</Main>
	);
}
