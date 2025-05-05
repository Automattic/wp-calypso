import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

export default function ActiveSubscriptions() {
	return (
		<PageLayout title={ __( 'Active Subscriptions' ) }>
			<div>Active subscriptions content will go here</div>
		</PageLayout>
	);
}
