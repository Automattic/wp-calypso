import { Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import BillingPageHeader from '../billing-page-header';
import UserTaxForm from './user-tax-form';

export default function UserTaxInfoPage() {
	return (
		<PageLayout
			size="small"
			header={
				<BillingPageHeader
					title={ __( 'Tax details' ) }
					description={ __( 'Configure tax details (VAT/GST/CT) to be included on all receipts.' ) }
				/>
			}
		>
			<VStack className="user-tax-info__form">
				<Card>
					<CardBody>
						<UserTaxForm />
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}
