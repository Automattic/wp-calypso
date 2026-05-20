import { type Site } from '@automattic/api-core';
import {
	siteApmAggregateQuery,
	siteApmEnabledMutation,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	privateApis,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect, useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Card } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import UpsellCallout from '../../hosting-feature-gated-with-callout/upsell';
import { hasBackendAccess } from '../backend-access';
import { getBackendCalloutProps } from '../backend-callout';
import { VIEWPORT_BREAKPOINTS } from '../constants';
import PerformanceTabs from '../performance-tabs';
import { mergeAggregates } from './aggregate';
import BackendStatusNotice from './backend-status';
import BackendTabs from './backend-tabs';
import Database from './database';
import ExternalRequests from './external-requests';
import Overview from './overview';
import BackendSubtitle from './subtitle';
import {
	isRollingTimeframe,
	timeframeToParams,
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

function StartCapturingButton( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_site_apm_enable_impression' );
	}, [ recordTracksEvent ] );

	const { mutate, isPending } = useMutation( {
		...siteApmEnabledMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'APM enabled.' ),
				error: __( 'Failed to enable APM.' ),
			},
		},
	} );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_site_apm_enable_click' );
		mutate( true );
	};

	return (
		<Button variant="primary" isBusy={ isPending } disabled={ isPending } onClick={ handleClick }>
			{ __( 'Start capturing' ) }
		</Button>
	);
}

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
	const params = useMemo( () => timeframeToParams( timeframe ), [ timeframe ] );
	const { data } = useSuspenseQuery( siteApmAggregateQuery( site.ID, params ) );
	const merged = useMemo( () => mergeAggregates( data.aggregates ), [ data.aggregates ] );
	const { summary } = merged;

	const apmEnabled = !! site.options?.apm_enabled;
	const isRollingWindow = isRollingTimeframe( timeframe );

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
