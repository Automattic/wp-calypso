import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import ReferralToggle from '../referral-toggle';

export default function MarketplaceProducts() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Products' ) }
					description={ __( 'À la carte products and extensions for your clients’ sites.' ) }
					actions={ <ReferralToggle /> }
				/>
			}
		/>
	);
}
