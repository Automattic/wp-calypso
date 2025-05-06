import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

export default function TaxDetails() {
	return (
		<PageLayout title={ __( 'Tax Details' ) }>
			<div>Tax details content will go here</div>
		</PageLayout>
	);
}
