import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function MonetizeSubscriptions() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Monetize subscriptions' ) } /> }>
			<div>Monetize Subscriptions content will go here</div>
		</PageLayout>
	);
}

export default MonetizeSubscriptions;
