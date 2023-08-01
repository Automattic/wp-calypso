import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import QueryJetpackPartnerPortalLicenseCounts from 'calypso/components/data/query-jetpack-partner-portal-license-counts';
import SiteAddLicenseNotification from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-add-license-notification';
import SiteSurveyBanner from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-survey-banner';
import SiteWelcomeBanner from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-welcome-banner';
import LicenseList from 'calypso/jetpack-cloud/sections/partner-portal/license-list';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import LicenseStateFilter from 'calypso/jetpack-cloud/sections/partner-portal/license-state-filter';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getLicenseCounts,
	hasFetchedLicenseCounts,
} from 'calypso/state/partner-portal/licenses/selectors';
import { showAgencyDashboard } from 'calypso/state/partner-portal/partner/selectors';
import Layout from '../../layout';
import LayoutHeader from '../../layout/header';
import LicenseSearch from '../../license-search';
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
		<Layout className="licenses" title={ translate( 'Licenses' ) } wide>
			<QueryJetpackPartnerPortalLicenseCounts />

			{ isAgencyUser && (
				<div>
					<SiteSurveyBanner />
					<SiteWelcomeBanner bannerKey="licenses-page" />
				</div>
			) }
			<SiteAddLicenseNotification />

			<LicenseListContext.Provider value={ context }>
				<div className="licenses__container">
					<div className="licenses__header-container">
						<div className="licenses__header">
							<LayoutHeader>
								<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>

								<SelectPartnerKeyDropdown />

								<Button
									href="/partner-portal/issue-license"
									onClick={ onIssueNewLicenseClick }
									primary
									style={ { marginLeft: 'auto' } }
								>
									{ translate( 'Issue New License' ) }
								</Button>
							</LayoutHeader>
						</div>
						<LicenseStateFilter />
					</div>
				</div>

				{ showEmptyStateContent ? (
					<OnboardingWidget isLicensesPage />
				) : (
					<div className="licenses__content">
						<LicenseSearch />
						<LicenseList />
					</div>
				) }
			</LicenseListContext.Provider>
		</Layout>
	);
}
