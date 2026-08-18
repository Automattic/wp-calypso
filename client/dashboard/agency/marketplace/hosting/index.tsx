import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import ReferralToggle from '../referral-toggle';

export default function MarketplaceHosting() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Hosting' ) }
					description={ __(
						'High performance, highly secure managed WordPress hosting for your clients.'
					) }
					actions={ <ReferralToggle /> }
				/>
			}
		/>
	);
}
