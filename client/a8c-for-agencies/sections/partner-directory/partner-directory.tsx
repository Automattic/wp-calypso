import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo } from 'react';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_OVERVIEW_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { Item as BreadcrumbItem } from 'calypso/components/breadcrumb';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { useSelector } from 'calypso/state';
import {
	getActiveAgency,
	isFetchingAgency,
	hasFetchedAgency,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import AgencyDetailsForm from './agency-details';
import AgencyExpertise from './agency-expertise';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
} from './constants';
import Dashboard from './dashboard';
import {
	mapAgencyDetailsFormData,
	mapApplicationFormData,
} from './utils/map-application-form-data';

import './style.scss';

type Props = {
	selectedSection: string;
};

interface Section {
	content: ReactNode;
	breadcrumbItems: BreadcrumbItem[];
	className?: string;
}

export default function PartnerDirectory( { selectedSection }: Props ) {
	const translate = useTranslate();
	const title = translate( 'Partner Directory' );

	const agency = useSelector( getActiveAgency );
	const hasAgency = useSelector( hasFetchedAgency );
	const isFetching = useSelector( isFetchingAgency );

	const applicationData = useMemo( () => mapApplicationFormData( agency ), [ agency ] );
	const agencyDetailsData = useMemo( () => mapAgencyDetailsFormData( agency ), [ agency ] );

	// Define the sub-menu sections
	const sections: { [ slug: string ]: Section } = useMemo( () => {
		const sections: { [ slug: string ]: Section } = {};

		sections[ PARTNER_DIRECTORY_DASHBOARD_SLUG ] = {
			content: <Dashboard />,
			breadcrumbItems: [
				{
					label: translate( 'Partner Directory' ),
					href: A4A_PARTNER_DIRECTORY_LINK,
				},
			],
			className: 'partner-directory__dashboard',
		};

		sections[ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG ] = {
			content: <AgencyDetailsForm initialFormData={ agencyDetailsData } />,
			breadcrumbItems: [
				...sections[ PARTNER_DIRECTORY_DASHBOARD_SLUG ].breadcrumbItems,
				{
					label: translate( 'Agency Details' ),
					href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
				},
			],
		};

		sections[ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG ] = {
			content: <AgencyExpertise initialFormData={ applicationData } />,
			breadcrumbItems: [
				...sections[ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG ].breadcrumbItems,
				{
					label: translate( 'Agency Expertise' ),
					href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }`,
				},
			],
		};

		return sections;
	}, [ translate, agencyDetailsData, applicationData ] );

	// Wait until the agency is fetched
	if ( ! hasAgency || isFetching ) {
		return null;
	}

	// Check if the Partner Directory is allowed for the agency
	if ( ! agency?.partner_directory.allowed && ! isEnabled( 'a8c-for-agencies-agency-tier' ) ) {
		// Redirect user to the Overview page
		page.redirect( A4A_OVERVIEW_LINK );
		return;
	}

	// Set the selected section
	const section: Section = sections[ selectedSection ];

	return (
		<Layout
			className={ clsx( section.className ) }
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					{ section.breadcrumbItems.length === 1 ? (
						<Title>{ title }</Title>
					) : (
						<Breadcrumb items={ section.breadcrumbItems } />
					) }
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody className="partner-directory__body">{ section.content }</LayoutBody>
		</Layout>
	);
}
