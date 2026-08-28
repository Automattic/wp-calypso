import {
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';

export default function MarketplaceHosting() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Hosting' ) }
					description={ __(
						'High performance, highly secure managed WordPress hosting for your clients.'
					) }
					actions={
						<HStack spacing={ 4 } justify="flex-end">
							<TermPricingToggle />
							<Divider
								orientation="vertical"
								style={ { color: 'var(--dashboard-overview__divider-color)', height: '24px' } }
							/>
							<ReferralToggle />
						</HStack>
					}
				/>
			}
		/>
	);
}
