import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	privateApis,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';

import './style.scss';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

// Same private Tabs the Performance and Plugins screens use; unlike TabPanel it
// renders arbitrary tab content, so each tier can carry its one-line guidance.
const { Tabs } = unlock( privateApis );

type HostingBrandKey = 'wpcom' | 'pressable' | 'vip';

const getHostingBrands = (): { key: HostingBrandKey; tier: string; subtitle: string }[] => [
	{
		key: 'wpcom',
		tier: __( 'Standard Agency Hosting' ),
		subtitle: __( 'Optimized and hassle-free hosting' ),
	},
	{
		key: 'pressable',
		tier: __( 'Premier Agency Hosting' ),
		subtitle: __( 'Best for large-scale businesses' ),
	},
	{
		key: 'vip',
		tier: __( 'Enterprise' ),
		subtitle: __( 'WordPress for enterprise-level demands' ),
	},
];

// Placeholder content until the per-host sections from the i3 design are built.
const PLACEHOLDERS: Record< HostingBrandKey, string > = {
	wpcom: 'WordPress.com hosting content will appear here.',
	pressable: 'Pressable hosting content will appear here.',
	vip: 'WordPress VIP hosting content will appear here.',
};

export default function MarketplaceHosting() {
	const hostingBrands = getHostingBrands();

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Hosting' ) }
					description={ __(
						'Choose the right hosting for each client, from single sites to enterprise platforms.'
					) }
					actions={ <ReferralToggle /> }
				/>
			}
		>
			<Tabs defaultTabId="wpcom">
				<HStack
					className="dashboard-marketplace-hosting__platform-bar"
					justify="space-between"
					wrap
				>
					<Tabs.TabList className="dashboard-marketplace-hosting__tabs">
						{ hostingBrands.map( ( brand ) => (
							<Tabs.Tab key={ brand.key } tabId={ brand.key }>
								<VStack spacing={ 0 } alignment="flex-start">
									<span>{ brand.tier }</span>
									<Text
										variant="muted"
										size={ 12 }
										className="dashboard-marketplace-hosting__tab-line"
									>
										{ brand.subtitle }
									</Text>
								</VStack>
							</Tabs.Tab>
						) ) }
					</Tabs.TabList>
					<TermPricingToggle />
				</HStack>
				{ hostingBrands.map( ( brand ) => (
					<Tabs.TabPanel key={ brand.key } tabId={ brand.key }>
						<Text variant="muted">{ PLACEHOLDERS[ brand.key ] }</Text>
					</Tabs.TabPanel>
				) ) }
			</Tabs>
		</PageLayout>
	);
}
