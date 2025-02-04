import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import UpdateCompanyDetailsForm from 'calypso/jetpack-cloud/sections/partner-portal/update-company-details-form';
import Layout from '../../layout';
import LayoutBody from '../../layout/body';
import LayoutHeader from '../../layout/header';
import LayoutTop from '../../layout/top';

import './style.scss';

export default function CompanyDetailsDashboard() {
	const translate = useTranslate();

	return (
		<Layout className="company-details-dashboard" title={ translate( 'Company Details' ) }>
			<LayoutTop>
				<LayoutHeader>
					<CardHeading size={ 36 }>{ translate( 'Company Details' ) }</CardHeading>
				</LayoutHeader>

				<p className="company-details-dashboard__description">
					{ translate(
						'Update your company details. Changes will be applied to all future invoices.'
					) }
				</p>
			</LayoutTop>

			<LayoutBody>
				<Card>
					<UpdateCompanyDetailsForm />
				</Card>
			</LayoutBody>
		</Layout>
	);
}
