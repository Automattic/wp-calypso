import { HostingFeatures, LogType, SiteActivityLog, ActivityLogParams } from '@automattic/api-core';
import { siteActivityLogQuery, siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { TabPanel, Card, CardHeader, CardBody } from '@wordpress/components';
import { DataViews, View, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { getLogsCalloutProps } from '../logs/logs-callout';
import { LOG_TABS } from '../logs/utils';
import { useActivityActions } from './dataviews/actions';
import { useActivityFields } from './dataviews/fields';
import { useActivityView } from './dataviews/views';

function SiteActivityLogs() {
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const siteId = site.ID;

	const { data } = useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => ( {
			gmtOffset: typeof s?.gmt_offset === 'number' ? s.gmt_offset : 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = data!;

	const [ view, setView ] = useActivityView();

	const activityLogQueryParams: ActivityLogParams = {
		sort_order: view.sort?.direction,
		number: view.perPage || 20,
		page: view.page,
	};

	const { data: activityLogData, isFetching } = useQuery(
		siteActivityLogQuery( siteId, activityLogQueryParams )
	);

	const logs = useMemo( () => {
		const suffix = `p${ view.page }`;

		const items = activityLogData?.activityLogs ?? [];
		return items.map( ( activity: SiteActivityLog, index: number ) => ( {
			...activity,
			id: `${ activity.activity_id }|${ suffix }|${ String( index ) }`,
		} ) );
	}, [ activityLogData?.activityLogs, view.page ] );

	const paginationInfo = {
		totalItems: activityLogData?.totalItems ?? 0,
		totalPages: activityLogData?.totalPages ?? 0,
	};

	// TODO extra the tab logic so it's independent and reusable
	const handleTabChange = ( tab: LogType ) => {
		if ( tab === LogType.PHP ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/php` } );
		} else if ( tab === LogType.SERVER ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/server` } );
		}
	};

	const fields = useActivityFields(
		timezoneString ? { gmtOffset, timezoneString } : { gmtOffset }
	);

	const actions = useActivityActions( { isLoading: isFetching } );

	const onChangeView = ( next: View ) => {
		setView( {
			...next,
			filters: [],
		} );
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Logs' ) } /> }>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.LOGS }
				asOverlay
				{ ...getLogsCalloutProps() }
			>
				<Card className="site-logs-card">
					<CardHeader style={ { paddingBottom: '0' } }>
						<TabPanel
							className="site-logs-tabs"
							activeClass="is-active"
							tabs={ LOG_TABS }
							onSelect={ ( tabName ) => {
								if ( tabName === LogType.PHP || tabName === LogType.SERVER ) {
									handleTabChange( tabName as LogType );
								}
							} }
							initialTabName={ LogType.ACTIVITY }
						>
							{ () => null }
						</TabPanel>
					</CardHeader>
					<CardBody>
						<DataViews< SiteActivityLog >
							data={ logs }
							isLoading={ isFetching }
							paginationInfo={ paginationInfo }
							fields={ fields as Field< SiteActivityLog >[] }
							view={ view }
							actions={ actions }
							search={ false }
							defaultLayouts={ { table: {} } }
							onChangeView={ onChangeView }
						/>
					</CardBody>
				</Card>
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteActivityLogs;
