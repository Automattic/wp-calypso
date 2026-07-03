import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function EarnWooPayments() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'WooPayments' ) }
					description={ __( 'Earn revenue share from WooPayments on your clients’ stores.' ) }
				/>
			}
		>
			{ /* TODO: Build the Earn WooPayments screen. */ }
		</PageLayout>
	);
}
