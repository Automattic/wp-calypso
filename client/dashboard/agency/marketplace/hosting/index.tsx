import {
	TabPanel,
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';

type HostingBrandKey = 'wpcom' | 'pressable' | 'vip';

const HOSTING_BRANDS: { key: HostingBrandKey; name: string }[] = [
	{ key: 'wpcom', name: 'WordPress.com' },
	{ key: 'pressable', name: 'Pressable' },
	{ key: 'vip', name: 'WordPress VIP' },
];

// Placeholder content until the per-host sections from the i1 design are built.
const PLACEHOLDERS: Record< HostingBrandKey, string > = {
	wpcom: 'WordPress.com hosting content will appear here.',
	pressable: 'Pressable hosting content will appear here.',
	vip: 'WordPress VIP hosting content will appear here.',
};

export default function MarketplaceHosting() {
	const [ selectedBrand, setSelectedBrand ] = useState< HostingBrandKey >( 'wpcom' );

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
		>
			<TabPanel
				tabs={ HOSTING_BRANDS.map( ( brand ) => ( { name: brand.key, title: brand.name } ) ) }
				initialTabName={ selectedBrand }
				onSelect={ ( tabName ) => setSelectedBrand( tabName as HostingBrandKey ) }
			>
				{ () => null }
			</TabPanel>
			<Text variant="muted">{ PLACEHOLDERS[ selectedBrand ] }</Text>
		</PageLayout>
	);
}
