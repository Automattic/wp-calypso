import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalText as Text, TabPanel } from '@wordpress/components';
import { DataViews, ViewTable } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { useLocale } from '../../app/locale';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteLogsQuery } from '../../app/queries/site-logs';
import { siteSettingsQuery } from '../../app/queries/site-settings';
import { siteRoute } from '../../app/router/sites';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import DataViewsCard from '../../components/dataviews-card';
import { DateRangePicker } from '../../components/date-range-picker';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { HostingFeatures } from '../../data/constants';
import { LogType, PHPLog, ServerLog, SiteLogsParams } from '../../data/site-logs';
import { parseYmdLocal, formatYmd } from '../../utils/datetime';
import { hasHostingFeature } from '../../utils/site-features';
import { useFields } from './dataviews/fields';
import { toFilterParams } from './dataviews/views';
import illustrationUrl from './logs-callout-illustration.svg';
import { buildTimeRangeInSeconds } from './utils';

export function SiteLogsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ chartBar }
			title={ __( 'Access detailed logs' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Quickly identify and fix issues before they impact your visitors with full visibility into your site‘s web server logs and PHP errors.'
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="logs"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

const LOG_TABS = [
	{ name: 'php', title: __( 'PHP error' ) },
	{ name: 'server', title: __( 'Web server' ) },
];

const EMPTY_ARRAY: ( ServerLog | PHPLog )[] = [];

function SiteLogs( { logType }: { logType: LogType } ) {
	const locale = useLocale();
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const siteId = site.ID;

	const { data } = useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => ( {
			gmtOffset: s?.gmt_offset ?? 0,
			timezoneString: s?.timezone_string ?? '',
		} ),
	} );

	const { gmtOffset, timezoneString } = data!;

	// @todo, this will be replaced when importing the use-view data.
	const view: ViewTable = useMemo( () => {
		if ( logType === 'php' ) {
			return {
				type: 'table',
				page: 1,
				perPage: 50,
				fields: [ 'severity', 'name', 'message' ],
				titleField: 'timestamp',
				sort: {
					field: 'timestamp',
					direction: 'desc',
				},
			};
		}
		return {
			type: 'table',
			page: 1,
			perPage: 50,
			fields: [ 'request_type', 'status', 'request_url' ],
			titleField: 'date',
			sort: {
				field: 'date',
				direction: 'desc',
			},
		};
	}, [ logType ] );

	const siteToday = parseYmdLocal( formatYmd( new Date(), timezoneString, gmtOffset ) )!;
	const initial = {
		start: new Date( siteToday.getFullYear(), siteToday.getMonth(), siteToday.getDate() - 6 ),
		end: siteToday,
	};

	const [ dateRange, setDateRange ] = useState< { start: Date; end: Date } >( () => initial );

	const { startSec, endSec } = useMemo(
		() => buildTimeRangeInSeconds( dateRange.start, dateRange.end, timezoneString, gmtOffset ),
		[ dateRange.start, dateRange.end, gmtOffset, timezoneString ]
	);

	const filter = useMemo( () => toFilterParams( { view, logType } ), [ view, logType ] );

	const params: SiteLogsParams = {
		logType,
		start: startSec,
		end: endSec,
		filter,
		sortOrder: view.sort?.direction,
		pageSize: view.perPage,
		pageIndex: view.page,
	};

	const { data: siteLogs, isFetching } = useQuery( {
		...siteLogsQuery( siteId, params, { keepPreviousData: true } ),
	} );
	const logs = Array.isArray( siteLogs?.logs ) ? siteLogs.logs : EMPTY_ARRAY;

	const paginationInfo = {
		totalItems: siteLogs?.total_results || 0,
		totalPages:
			!! siteLogs?.total_results && !! view.perPage
				? Math.ceil( siteLogs.total_results / view.perPage )
				: 0,
	};

	const handleTabChange = ( tab: LogType ) => {
		if ( tab === LogType.PHP ) {
			router.navigate( { to: `/sites/${ siteSlug }/logs/php` } );
		} else {
			router.navigate( { to: `/sites/${ siteSlug }/logs/server` } );
		}
	};

	//	const fields = useFields( { logType, timezoneString } );
	const fields = useFields( {
		logType,
		timezoneString: timezoneString || undefined,
		gmtOffset,
	} );

	// @todo, this will be replaced when importing the use-view data.
	const actions = useMemo(
		() => [
			{
				id: 'copy-msg',
				label: 'Copy message',
				disabled: isFetching,
				supportsBulk: false,
				callback: async ( items: ( PHPLog | ServerLog )[] ) => {
					const message = ( items[ 0 ] as PHPLog ).message;
					// Removing any actual message confirmation functionality for now, with dummy data
					// eslint-disable-next-line no-console
					console.log( 'Copied message:', message );
				},
			},
		],
		[ isFetching ]
	);

	if ( ! site ) {
		return;
	}

	return (
		<PageLayout header={ <PageHeader title={ __( 'Logs' ) } /> }>
			<DateRangePicker
				start={ dateRange.start }
				end={ dateRange.end }
				gmtOffset={ gmtOffset }
				timezoneString={ timezoneString }
				locale={ locale }
				onChange={ ( next ) => setDateRange( next ) }
			/>

			<CalloutOverlay
				showCallout={ ! hasHostingFeature( site, HostingFeatures.LOGS ) }
				callout={ <SiteLogsCallout siteSlug={ site.slug } /> }
				main={
					<TabPanel
						className="site-logs-tabs"
						activeClass="is-active"
						tabs={ LOG_TABS }
						onSelect={ ( tabName ) => {
							if ( tabName === LogType.PHP || tabName === LogType.SERVER ) {
								handleTabChange( tabName );
							}
						} }
						initialTabName={ logType }
					>
						{ () => (
							<DataViewsCard>
								<DataViews< PHPLog | ServerLog >
									data={ logs ?? [] }
									isLoading={ isFetching }
									paginationInfo={ paginationInfo }
									fields={ fields ?? [] }
									view={ view }
									actions={ actions }
									search={ false }
									defaultLayouts={ { table: {} } }
									onChangeView={ () => {} }
								/>
							</DataViewsCard>
						) }
					</TabPanel>
				}
			/>
		</PageLayout>
	);
}

export default SiteLogs;
