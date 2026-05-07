import { type Site } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	privateApis,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Card } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import UpsellCallout from '../../hosting-feature-gated-with-callout/upsell';
import { hasBackendAccess } from '../backend-access';
import { getBackendCalloutProps } from '../backend-callout';
import { VIEWPORT_BREAKPOINTS } from '../constants';
import PerformanceTabs from '../performance-tabs';
import BackendStatusNotice from './backend-status';
import BackendTabs from './backend-tabs';
import Database from './database';
import EnableApmCallout from './enable-apm-callout';
import ExternalRequests from './external-requests';
import { siteApmOverviewQuery } from './mock-data';
import Overview from './overview';
import Requests from './requests';
import Transactions from './transactions';

export type ApmTab = 'overview' | 'requests' | 'transactions' | 'database' | 'external-requests';

const TAB_PATHS: Record< ApmTab, string > = {
	overview: '',
	requests: 'requests',
	transactions: 'transactions',
	database: 'database',
	'external-requests': 'external-requests',
};

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

function ApmDashboard( { site, tab }: { site: Site; tab: ApmTab } ) {
	const router = useRouter();
	const siteSlug = site.slug;
	const isDesktop = useViewportMatch( VIEWPORT_BREAKPOINTS.desktop );
	const { data } = useSuspenseQuery( siteApmOverviewQuery( site.ID ) );

	const handleTabChange = ( name: string ) => {
		const next = name as ApmTab;
		if ( next === tab ) {
			return;
		}
		const path = TAB_PATHS[ next ];
		router.navigate( {
			to: path
				? `/sites/${ siteSlug }/performance/backend/${ path }`
				: `/sites/${ siteSlug }/performance/backend`,
		} );
	};

	const renderTab = () => {
		switch ( tab ) {
			case 'overview':
				return <Overview site={ site } />;
			case 'requests':
				return <Requests />;
			case 'transactions':
				return <Transactions />;
			case 'database':
				return <Database />;
			case 'external-requests':
				return <ExternalRequests />;
		}
	};

	return (
		<VStack spacing={ 6 }>
			<BackendStatusNotice avgResponseMs={ data.summary.avg_response_ms } />
			<Tabs
				orientation={ isDesktop ? 'vertical' : 'horizontal' }
				selectedTabId={ tab }
				onSelect={ handleTabChange }
			>
				<HStack wrap={ ! isDesktop } alignment="flex-start" justify="flex-start" spacing={ 6 }>
					<Card
						style={ {
							flex: '0 0 auto',
							width: isDesktop ? 280 : '100%',
							alignSelf: 'flex-start',
						} }
					>
						<BackendTabs compact={ ! isDesktop } summary={ data.summary } />
					</Card>
					<div style={ { flex: '1 1 auto', minWidth: 0, width: '100%' } }>
						<Tabs.TabPanel tabId={ tab }>{ renderTab() }</Tabs.TabPanel>
					</div>
				</HStack>
			</Tabs>
		</VStack>
	);
}

export default function SitePerformanceBackend( {
	siteSlug,
	tab = 'overview',
}: {
	siteSlug: string;
	tab?: ApmTab;
} ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const renderContent = () => {
		if ( ! hasBackendAccess( site.plan?.product_slug ) ) {
			return <UpsellCallout site={ site } { ...getBackendCalloutProps() } />;
		}

		if ( ! site.options?.apm_enabled ) {
			return <EnableApmCallout site={ site } />;
		}

		return <ApmDashboard site={ site } tab={ tab } />;
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Backend' ) } /> }>
			<PerformanceTabs siteSlug={ siteSlug } activeTab="backend" />
			{ renderContent() }
		</PageLayout>
	);
}
