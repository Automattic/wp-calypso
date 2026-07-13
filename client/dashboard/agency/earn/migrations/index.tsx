import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function EarnMigrations() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Migrations' ) }
					description={ __( 'Earn commissions for migrating sites to Automattic hosting.' ) }
				/>
			}
		>
			{ /* TODO: Build the Earn migrations screen. */ }
		</PageLayout>
	);
}
