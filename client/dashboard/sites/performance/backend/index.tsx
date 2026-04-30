import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import UpsellCallout from '../../hosting-feature-gated-with-callout/upsell';
import { getBackendCalloutProps } from '../backend-callout';
import { hasApmAccess } from './access';
import Database from './database';
import EnableApmCallout from './enable-apm-callout';
import ExternalRequests from './external-requests';
import Overview from './overview';
import Requests from './requests';
import Transactions from './transactions';
import type { Site } from '@automattic/api-core';

export type ApmTab = 'overview' | 'requests' | 'transactions' | 'database' | 'external-requests';

const TAB_LABELS: Record< ApmTab, string > = {
	overview: __( 'Overview' ),
	requests: __( 'Requests' ),
	transactions: __( 'Transactions' ),
	database: __( 'Database' ),
	'external-requests': __( 'External requests' ),
};

const TAB_PATHS: Record< ApmTab, string > = {
	overview: '',
	requests: 'requests',
	transactions: 'transactions',
	database: 'database',
	'external-requests': 'external-requests',
};

function ApmDashboard( { site, tab }: { site: Site; tab: ApmTab } ) {
	const router = useRouter();
	const siteSlug = site.slug;

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

	const tabs = ( Object.keys( TAB_LABELS ) as ApmTab[] ).map( ( name ) => ( {
		name,
		title: TAB_LABELS[ name ],
	} ) );

	return (
		<Card>
			<CardHeader style={ { paddingBottom: 0 } }>
				<TabPanel
					activeClass="is-active"
					tabs={ tabs }
					initialTabName={ tab }
					onSelect={ handleTabChange }
				>
					{ () => null }
				</TabPanel>
			</CardHeader>
			<CardBody>{ renderTab() }</CardBody>
		</Card>
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
		if ( ! hasApmAccess( site.plan?.product_slug ) ) {
			return <UpsellCallout site={ site } { ...getBackendCalloutProps() } />;
		}

		if ( ! site.options?.apm_enabled ) {
			return <EnableApmCallout site={ site } />;
		}

		return <ApmDashboard site={ site } tab={ tab } />;
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Backend' ) } /> }>{ renderContent() }</PageLayout>
	);
}
