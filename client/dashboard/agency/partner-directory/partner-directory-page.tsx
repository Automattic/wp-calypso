import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { privateApis } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasApprovedDirectory } from './lib';
import { PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE, PARTNER_DIRECTORY_ROUTE } from './paths';

export type PartnerDirectoryTab = 'overview' | 'lead-matching';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

const TAB_ROUTES: Record< PartnerDirectoryTab, string > = {
	overview: PARTNER_DIRECTORY_ROUTE,
	'lead-matching': PARTNER_DIRECTORY_LEAD_MATCHING_ROUTE,
};

/**
 * Shared shell for the Partner Directories views. Each tab keeps its own route
 * so it stays deep-linkable. Lead matching opens once a directory is approved,
 * so until then there is only one view and no tab bar.
 */
export default function PartnerDirectoryPage( {
	tab,
	children,
}: {
	tab: PartnerDirectoryTab;
	children: React.ReactNode;
} ) {
	const router = useRouter();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const hasTabs = hasApprovedDirectory( agency?.profile?.partner_directory_application );

	const header = (
		<PageHeader
			title={ __( 'Partner Directories' ) }
			description={ __(
				'List your agency in Automattic’s Partner Directories to showcase your skills and attract new clients.'
			) }
		/>
	);

	if ( ! hasTabs ) {
		return (
			<PageLayout size="small" header={ header }>
				{ children }
			</PageLayout>
		);
	}

	const handleSelect = ( name: string ) => {
		const next = name as PartnerDirectoryTab;
		if ( next === tab ) {
			return;
		}
		router.navigate( { to: TAB_ROUTES[ next ] } );
	};

	return (
		<PageLayout size="small" header={ header }>
			<Tabs selectedTabId={ tab } onSelect={ handleSelect }>
				<Tabs.TabList>
					<Tabs.Tab tabId="overview">{ __( 'Overview' ) }</Tabs.Tab>
					<Tabs.Tab tabId="lead-matching">{ __( 'Lead matching' ) }</Tabs.Tab>
				</Tabs.TabList>
				<Tabs.TabPanel tabId={ tab }>{ children }</Tabs.TabPanel>
			</Tabs>
		</PageLayout>
	);
}
