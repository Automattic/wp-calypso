import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import CompanyDetailsForm from 'calypso/jetpack-cloud/sections/partner-portal/company-details-form';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import './style.scss';

export default function CompanyDetailsDashboard(): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout className="company-details-dashboard">
			<DocumentHead title={ translate( 'Company Details' ) } />
			<SidebarNavigation />

			<div className="company-details-dashboard__header">
				<CardHeading size={ 36 }>{ translate( 'Company Details' ) }</CardHeading>

				<p className="company-details-dashboard__description">
					{ translate(
						'Update your company details. Changes will be applied to all future invoices.'
					) }
				</p>
			</div>

			<CompanyDetailsForm />
		</Main>
	);
}
