import { isEnabled } from '@automattic/calypso-config';
import { useRouter } from '@tanstack/react-router';
import { privateApis } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SitesNoticeArbiter } from '../notice-arbiter';

export type PerformanceTab = 'frontend' | 'backend';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

/**
 * Shared shell for the two Performance views. Each view keeps its own route so
 * it stays deep-linkable, but they share one page title and one tab bar so they
 * read as a single page.
 */
export default function PerformancePage( {
	siteSlug,
	tab,
	description,
	actions,
	children,
}: {
	siteSlug: string;
	tab: PerformanceTab;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	children: React.ReactNode;
} ) {
	const router = useRouter();

	const header = (
		<PageHeader title={ __( 'Performance' ) } description={ description } actions={ actions } />
	);

	// Without APM there is only one view, so a tab bar would be noise.
	if ( ! isEnabled( 'performance/apm' ) ) {
		return (
			<PageLayout header={ header } notices={ <SitesNoticeArbiter /> }>
				{ children }
			</PageLayout>
		);
	}

	const handleSelect = ( name: string ) => {
		const next = name as PerformanceTab;
		if ( next === tab ) {
			return;
		}
		router.navigate( { to: `/sites/${ siteSlug }/performance/${ next }` } );
	};

	return (
		<PageLayout header={ header } notices={ <SitesNoticeArbiter /> }>
			<Tabs selectedTabId={ tab } onSelect={ handleSelect }>
				<Tabs.TabList>
					<Tabs.Tab tabId="frontend">{ __( 'Page speed' ) }</Tabs.Tab>
					<Tabs.Tab tabId="backend">{ __( 'Server response' ) }</Tabs.Tab>
				</Tabs.TabList>
				<Tabs.TabPanel tabId={ tab }>{ children }</Tabs.TabPanel>
			</Tabs>
		</PageLayout>
	);
}
