import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function EarnReferrals() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Referrals' ) }
					description={ __( 'Refer products and services and earn commissions.' ) }
				/>
			}
		>
			{ /* TODO: Build the Earn referrals screen. */ }
		</PageLayout>
	);
}
