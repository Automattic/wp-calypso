import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function ActiveSubscriptions() {
	return (
		<PageLayout size="small">
			<PageHeader title={ __( 'Active Subscriptions' ) } level={ 1 } />
			<div>Active subscriptions content will go here</div>
		</PageLayout>
	);
}
