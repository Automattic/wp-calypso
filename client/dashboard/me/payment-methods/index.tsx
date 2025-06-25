import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function PaymentMethods() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Payment Methods' ) } /> }>
			<div>Payment methods content will go here</div>
		</PageLayout>
	);
}
