import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
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
import { Agency } from 'calypso/state/a8c-for-agencies/types';
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
} from './utils/map-application-form-data';

import './style.scss';

// DEV MOCK: Create a fully-approved agency for testing the completed state
const createMockApprovedAgency = (): Agency => ( {
	id: 12345,
	name: 'Demo Agency',
	url: 'https://demo-agency.com',
	icon: {
		img: '',
		icon: '',
	},
	third_party: null,
	profile: {
		company_details: {
			name: 'Demo Agency',
			email: 'hello@demo-agency.com',
			website: 'https://demo-agency.com',
			bio_description:
				'We are a full-service digital agency specializing in WordPress development, WooCommerce stores, and Jetpack optimization. Our team has over 10 years of experience building high-performance websites.',
			logo_url: 'https://s0.wp.com/i/webclip.png',
			landing_page_url: 'https://demo-agency.com/services',
			country: 'US',
		},
		listing_details: {
			is_available: true,
			is_global: true,
			industries: [ 'e_commerce_and_retail', 'technology_and_it_services' ],
			services: [ 'website_online_store_development', 'site_maintenance_platform_integration' ],
			products: [ 'wordpress_com', 'woocommerce', 'jetpack', 'pressable' ],
			languages_spoken: [ 'en', 'es' ],
		},
		budget_details: {
			budget_lower_range: '5000',
			budget_upper_range: '50000',
			has_hourly_rate: true,
			hourly_rate_value: '150',
		},
		partner_directory_application: {
			status: 'completed',
			is_published: true,
			feedback_url: '',
			directories: [
				{
					directory: 'wordpress',
					status: 'approved',
					is_published: true,
					urls: [ 'https://demo-agency.com' ],
					note: '',
				},
				{
					directory: 'woocommerce',
					status: 'approved',
					is_published: true,
					urls: [ 'https://demo-agency.com/woo' ],
					note: '',
				},
				{
					directory: 'jetpack',
					status: 'approved',
					is_published: true,
					urls: [ 'https://demo-agency.com/jetpack' ],
					note: '',
				},
				{
					directory: 'pressable',
					status: 'approved',
					is_published: true,
					urls: [ 'https://demo-agency.com/pressable' ],
					note: '',
				},
			],
		},
	},
	partner_directory: {
		allowed: true,
		directories: [ 'wordpress', 'woocommerce', 'jetpack', 'pressable' ],
	},
	user: {
		role: 'a4a_administrator',
		capabilities: [],
	},
	can_issue_licenses: true,
	notifications: [],
	signup_meta: {
		number_sites: '10',
	},
	tier: {
		id: 'emerging-partner',
		label: 'Emerging Partner',
		features: [],
		status: 'early_access',
	},
	influenced_revenue: 10000,
	approval_status: 'approved',
	created_at: '2024-01-01T00:00:00Z',
} );

// Check for mock mode via URL parameter (synchronous check)
const useMockMode = () => {
	return useMemo( () => {
		if ( typeof window !== 'undefined' ) {
			const params = new URLSearchParams( window.location.search );
			return params.get( 'mock' ) === 'approved';
		}
		return false;
	}, [] );
};

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

	const isMockMode = useMockMode();
	const realAgency = useSelector( getActiveAgency );
	const mockAgency = useMemo( () => createMockApprovedAgency(), [] );
	const agency = isMockMode ? mockAgency : realAgency;
	const hasAgency = useSelector( hasFetchedAgency );
	const isFetching = useSelector( isFetchingAgency );

	const applicationData = useMemo( () => mapApplicationFormData( agency ), [ agency ] );
	const agencyDetailsData = useMemo( () => mapAgencyDetailsFormData( agency ), [ agency ] );
	const leadMatchingData = useMemo( () => mapLeadMatchingFormData( agency ), [ agency ] );

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

		sections[ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG ] = {
			content: <LeadMatchingForm initialFormData={ leadMatchingData } />,
			breadcrumbItems: [
				...sections[ PARTNER_DIRECTORY_DASHBOARD_SLUG ].breadcrumbItems,
				{
					label: translate( 'Lead Matching' ),
					href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG }`,
				},
			],
		};

		return sections;
	}, [ translate, agencyDetailsData, applicationData, leadMatchingData ] );

	// Wait until the agency is fetched (skip check in mock mode)
	if ( ! isMockMode && ( ! hasAgency || isFetching ) ) {
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
