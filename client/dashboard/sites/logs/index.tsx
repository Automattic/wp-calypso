import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __experimentalText as Text, TabPanel } from '@wordpress/components';
import { DataViews, ViewTable } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useMemo } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteLogsQuery } from '../../app/queries/site-logs';
import { siteRoute } from '../../app/router/sites';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { HostingFeatures } from '../../data/constants';
import { LogType, PHPLog, ServerLog, SiteLogsParams } from '../../data/site-logs';
import { hasHostingFeature } from '../../utils/site-features';
import { useFields } from './dataviews/fields';
import { toFilterParams } from './dataviews/views';
import illustrationUrl from './logs-callout-illustration.svg';

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
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

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

	// @todo, this will be replaced when importing / replacing moment usage and related functionality.
	const [ startTime, endTime ] = useMemo( () => {
		const now = Math.floor( Date.now() / 1000 );
		return [ now - 1209600, now ];
	}, [] );

	const filter = useMemo( () => toFilterParams( { view, logType } ), [ view, logType ] );

	// @todo: We'll be able to remove the fallbacks once the temporary data (fields, views, actions) are removed and this component is cleaned up, as we'll return earlier if site doesn't exist.
	const siteId = site?.ID ?? null;

	const params: SiteLogsParams = {
		logType,
		start: startTime,
		end: endTime,
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

	const fields = useFields( { logType } );

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
