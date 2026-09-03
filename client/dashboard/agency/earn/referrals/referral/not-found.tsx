import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';

export default function ReferralNotFound() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Referral not found' ) }
					description={ __( 'This referral could not be found.' ) }
				/>
			}
		/>
	);
}
