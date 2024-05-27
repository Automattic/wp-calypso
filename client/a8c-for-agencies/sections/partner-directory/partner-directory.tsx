import { useTranslate } from 'i18n-calypso';
import React, { ReactNode } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { Item as BreadcrumbItem } from 'calypso/components/breadcrumb';
import AgencyDetails from './agency-details';
import AgencyExpertise from './agency-expertise';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
} from './constants';
import Dashboard from './dashboard';

type Props = {
	selectedSection: string;
};

export default function PartnerDirectory( { selectedSection }: Props ) {
	const translate = useTranslate();
	const title = translate( 'Partner Directory' );

	const section: { content: ReactNode | undefined; breadcrumbItems: BreadcrumbItem[] } = {
		content: <Dashboard />,
		breadcrumbItems: [
			{
				label: translate( 'Partner Directory' ),
				href: A4A_PARTNER_DIRECTORY_LINK,
			},
		],
	};

	switch ( selectedSection ) {
		case PARTNER_DIRECTORY_DASHBOARD_SLUG:
			section.content = <Dashboard />;
			break;
		case PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG:
			section.content = <AgencyDetails />;
			section.breadcrumbItems.push( {
				label: translate( 'Agency Details' ),
				href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
			} );
			break;
		case PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG:
			section.content = <AgencyExpertise />;
			section.breadcrumbItems.push( {
				label: translate( 'Agency Details' ),
				href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }`,
			} );
			section.breadcrumbItems.push( {
				label: translate( 'Agency Expertise' ),
				href: `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }`,
			} );
			break;
	}

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					{ section.breadcrumbItems.length === 1 ? (
						<Title>{ title }</Title>
					) : (
						<Breadcrumb items={ section.breadcrumbItems } />
					) }
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>{ section.content }</LayoutBody>
		</Layout>
	);
}
