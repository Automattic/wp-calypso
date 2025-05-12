import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function PaymentMethods() {
	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Payment Methods' ) } level={ 1 } />
			<div>Payment methods content will go here</div>
		</PageLayout>
	);
}
