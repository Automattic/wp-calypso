import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function ActiveSubscriptions() {
	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Active Subscriptions' ) } />
			<div>Active subscriptions content will go here</div>
		</PageLayout>
	);
}
