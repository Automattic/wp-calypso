import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import CardHeading from 'calypso/components/card-heading';
import QueryJetpackPartnerPortalLicenseCounts from 'calypso/components/data/query-jetpack-partner-portal-license-counts';
import SiteAddLicenseNotification from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-add-license-notification';
import LicenseList from 'calypso/jetpack-cloud/sections/partner-portal/license-list';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import LicenseStateFilter from 'calypso/jetpack-cloud/sections/partner-portal/license-state-filter';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice } from 'calypso/state/notices/actions';
import {
	getLicenseCounts,
	hasFetchedLicenseCounts,
} from 'calypso/state/partner-portal/licenses/selectors';
import { showAgencyDashboard } from 'calypso/state/partner-portal/partner/selectors';
import Layout from '../../layout';
import LayoutBody from '../../layout/body';
import LayoutHeader from '../../layout/header';
import LayoutTop from '../../layout/top';
import LicenseSearch from '../../license-search';
import OnboardingWidget from '../onboarding-widget';
import Banners from './banners';
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
	const provisioningSite = getQueryArg( window.location.href, 'provisioning' ) as string;

	useEffect( () => {
		if ( 'true' === provisioningSite ) {
			dispatch(
				infoNotice(
					translate(
						'We are creating a WordPress.com site in the background. It will appear on your dashboard shortly.'
					),
					{ id: 'provisioning-site-notice' }
				)
			);
		}
	}, [ provisioningSite, translate, dispatch ] );

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

	const isNewNavigation = isEnabled( 'jetpack/new-navigation' );

	return (
		<Layout
			className="licenses"
			title={ translate( 'Licenses' ) }
			wide
			withBorder={ ! isNewNavigation }
		>
			<PageViewTracker
				title="Partner Portal > Licenses"
				path="/partner-portal/licenses/:filter"
				properties={ { filter } }
			/>
			<QueryJetpackPartnerPortalLicenseCounts />

			<LicenseListContext.Provider value={ context }>
				<LayoutTop>
					{ isAgencyUser && <Banners /> }
					<SiteAddLicenseNotification />

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

					<LicenseStateFilter />
				</LayoutTop>

				<LayoutBody>
					{ showEmptyStateContent ? (
						<OnboardingWidget isLicensesPage />
					) : (
						<>
							<LicenseSearch />
							<LicenseList />
						</>
					) }
				</LayoutBody>
			</LicenseListContext.Provider>
		</Layout>
	);
}
