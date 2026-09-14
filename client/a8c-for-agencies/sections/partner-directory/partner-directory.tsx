import { Spinner } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useLeadMatchingProfile from 'calypso/a8c-for-agencies/data/partner-directory/use-lead-matching-profile';
import { Item as BreadcrumbItem } from 'calypso/components/breadcrumb';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
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
	PARTNER_DIRECTORY_LEAD_MATCHING_SLUG,
} from './constants';
import Dashboard from './dashboard';
import LeadMatchingForm from './lead-matching';
import {
	mapAgencyDetailsFormData,
	mapApplicationFormData,
	mapLeadMatchingFormData,
	mapLeadMatchingProfileToFormData,
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
	const title = translate( 'Partner Directories' );

	const agency = useSelector( getActiveAgency );
	const hasAgency = useSelector( hasFetchedAgency );
	const isFetching = useSelector( isFetchingAgency );
	const shouldFetchLeadMatching =
		selectedSection === PARTNER_DIRECTORY_LEAD_MATCHING_SLUG && hasAgency && ! isFetching;
	const leadMatchingProfileQuery = useLeadMatchingProfile( shouldFetchLeadMatching );

	const applicationData = useMemo( () => mapApplicationFormData( agency ), [ agency ] );
	const agencyDetailsData = useMemo( () => mapAgencyDetailsFormData( agency ), [ agency ] );
	const leadMatchingProfile =
		leadMatchingProfileQuery.data?.lead_matching_profile ?? agency?.lead_matching?.profile ?? null;
	const leadMatchingData = useMemo(
		() =>
			leadMatchingProfileQuery.data?.lead_matching_profile
				? mapLeadMatchingProfileToFormData( leadMatchingProfileQuery.data.lead_matching_profile )
				: mapLeadMatchingFormData( agency ),
		[ agency, leadMatchingProfileQuery.data?.lead_matching_profile ]
	);
	const isLeadMatchingLoading =
		selectedSection === PARTNER_DIRECTORY_LEAD_MATCHING_SLUG &&
		leadMatchingProfileQuery.isLoading &&
		! leadMatchingProfileQuery.data;

	// Define the sub-menu sections
	const sections: { [ slug: string ]: Section } = useMemo( () => {
		const sections: { [ slug: string ]: Section } = {};

		sections[ PARTNER_DIRECTORY_DASHBOARD_SLUG ] = {
			content: <Dashboard />,
			breadcrumbItems: [
				{
					label: translate( 'Partner Directories' ),
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
					label: translate( 'Agency details' ),
					href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
				},
			],
		};

		sections[ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG ] = {
			content: <AgencyExpertise initialFormData={ applicationData } />,
			breadcrumbItems: [
				...sections[ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG ].breadcrumbItems,
				{
					label: translate( 'Agency expertise' ),
					href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }`,
				},
			],
		};

		sections[ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG ] = {
			content: isLeadMatchingLoading ? (
				<Spinner />
			) : (
				<LeadMatchingForm initialFormData={ leadMatchingData } profile={ leadMatchingProfile } />
			),
			breadcrumbItems: [
				...sections[ PARTNER_DIRECTORY_DASHBOARD_SLUG ].breadcrumbItems,
				{
					label: translate( 'Lead matching' ),
					href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG }`,
				},
			],
		};

		return sections;
	}, [
		translate,
		agencyDetailsData,
		applicationData,
		isLeadMatchingLoading,
		leadMatchingData,
		leadMatchingProfile,
	] );

	// Wait until the agency is fetched
	if ( ! hasAgency || isFetching ) {
		return null;
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
