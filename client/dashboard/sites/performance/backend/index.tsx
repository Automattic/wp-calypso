import { type Site } from '@automattic/api-core';
import { siteApmAggregateRollingQuery, siteBySlugQuery } from '@automattic/api-queries';
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
import { useMemo } from 'react';
import { Card } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import UpsellCallout from '../../hosting-feature-gated-with-callout/upsell';
import { hasBackendAccess } from '../backend-access';
import { getBackendCalloutProps } from '../backend-callout';
import { VIEWPORT_BREAKPOINTS } from '../constants';
import PerformanceTabs from '../performance-tabs';
import { mergeAggregates } from './aggregate';
import BackendEmptyState from './backend-empty-state';
import BackendStatusNotice from './backend-status';
import BackendTabs from './backend-tabs';
import Database from './database';
import ExternalRequests from './external-requests';
import Overview from './overview';
import StartCapturingButton from './start-capturing-button';
import BackendSubtitle from './subtitle';
import {
	isRollingTimeframe,
	TIMEFRAME_SECONDS,
	usePersistedTimeframe,
	type Timeframe,
} from './timeframe';
import TimeframeSelector from './timeframe-selector';
import Transactions from './transactions';
import WordPress from './wordpress';

export type ApmTab = 'overview' | 'transactions' | 'wordpress' | 'database' | 'external-requests';

const TAB_PATHS: Record< ApmTab, string > = {
	overview: '',
	transactions: 'transactions',
	wordpress: 'wordpress',
	database: 'database',
	'external-requests': 'external-requests',
};

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

// Poll the APM aggregate every 10s while capturing is on. Each poll only
// fetches the delta from the latest cached bucket (see
// `siteApmAggregateRollingQuery`), so polling this frequently stays cheap.
const APM_POLL_INTERVAL_MS = 10_000;

function ApmDashboard( {
	site,
	tab,
	timeframe,
}: {
	site: Site;
	tab: ApmTab;
	timeframe: Timeframe;
} ) {
	const router = useRouter();
	const siteSlug = site.slug;
	const isDesktop = useViewportMatch( VIEWPORT_BREAKPOINTS.desktop );
	const apmEnabled = !! site.options?.apm_enabled;
	const windowSec = TIMEFRAME_SECONDS[ timeframe ];
	const { data } = useSuspenseQuery( {
		...siteApmAggregateRollingQuery( site.ID, windowSec ),
		// Only poll while capturing is on. When it's off there's no new data to
		// fetch, so polling would just be background noise.
		refetchInterval: apmEnabled ? APM_POLL_INTERVAL_MS : false,
		refetchIntervalInBackground: false,
	} );
	const merged = useMemo(
		() => mergeAggregates( data.aggregates, windowSec ),
		[ data.aggregates, windowSec ]
	);
	const { summary } = merged;

	const isRollingWindow = isRollingTimeframe( timeframe );
	const hasData = summary.transaction_count > 0;

	// Only show the prominent empty state when APM is off — that's the case
	// where the user needs to take action. When APM is on but no data has come
	// in yet, the regular dashboard with the "Capturing" notice is enough.
	if ( ! hasData && ! apmEnabled ) {
		return <BackendEmptyState site={ site } timeframe={ timeframe } />;
	}

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
				return <Overview merged={ merged } />;
			case 'transactions':
				return <Transactions merged={ merged } />;
			case 'wordpress':
				return <WordPress merged={ merged } />;
			case 'database':
				return <Database merged={ merged } />;
			case 'external-requests':
				return <ExternalRequests merged={ merged } />;
		}
	};

	return (
		<VStack spacing={ 6 }>
			<BackendStatusNotice
				summary={ summary }
				apmEnabled={ apmEnabled }
				isRollingWindow={ isRollingWindow }
			/>
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
						<BackendTabs compact={ ! isDesktop } summary={ summary } />
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
	const userHasBackendAccess = hasBackendAccess( site.plan?.product_slug );
	const apmEnabled = !! site.options?.apm_enabled;
	const [ timeframe, setTimeframe ] = usePersistedTimeframe();

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Backend' ) }
					description={
						userHasBackendAccess ? <BackendSubtitle capturing={ apmEnabled } /> : undefined
					}
					actions={
						userHasBackendAccess ? (
							<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
								<TimeframeSelector value={ timeframe } onChange={ setTimeframe } />
								{ ! apmEnabled && <StartCapturingButton site={ site } /> }
							</HStack>
						) : undefined
					}
				/>
			}
		>
			<PerformanceTabs siteSlug={ siteSlug } activeTab="backend" />
			{ userHasBackendAccess ? (
				<ApmDashboard site={ site } tab={ tab } timeframe={ timeframe } />
			) : (
				<UpsellCallout site={ site } { ...getBackendCalloutProps() } />
			) }
		</PageLayout>
	);
}
