import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

export default function PaymentMethods() {
	return (
		<PageLayout title={ __( 'Payment Methods' ) } size="small">
			<div>Payment methods content will go here</div>
		</PageLayout>
	);
}
