import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function EarnPayoutSettings() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Payout settings' ) }
					description={ __( 'Manage where and how your agency gets paid.' ) }
				/>
			}
		>
			{ /* TODO: Build the Earn payout settings screen. */ }
		</PageLayout>
	);
}
