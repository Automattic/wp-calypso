import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function EarnOverview() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Overview' ) }
					description={ __( 'Track and manage the ways your agency earns with Automattic.' ) }
				/>
			}
		>
			{ /* TODO: Build the Earn overview screen. */ }
		</PageLayout>
	);
}
