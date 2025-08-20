import { formatNumber } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { siteBySlugQuery } from '../../../app/queries/site';
import { siteSettingsQuery } from '../../../app/queries/site-settings';
import { siteRoute } from '../../../app/router/sites';
import { LogType } from '../../../data/site-logs';
import { formatDateWithOffset, getUtcOffsetDisplay } from '../../../utils/datetime';
import type { PHPLog, ServerLog } from '../../../data/site-logs';
import type { Field, Operator } from '@wordpress/dataviews';

import './style.scss';

const VALUES_CACHED = [ 'false', 'true' ] as const;
const VALUES_RENDERER = [ 'php', 'static' ] as const;
const VALUES_REQUEST_TYPE = [ 'GET', 'HEAD', 'POST', 'PUT', 'DELETE' ] as const;
const VALUES_SEVERITY = [ 'User', 'Warning', 'Deprecated', 'Fatal error' ] as const;
const VALUES_STATUS = [ '200', '301', '302', '400', '401', '403', '404', '429', '500' ] as const;

const getLabelCached = ( cached: string ) => {
	switch ( cached ) {
		case 'false':
			return 'False';
		case 'true':
			return 'True';
		default:
			return cached;
	}
};
const getLabelRenderer = ( renderer: string ) => {
	switch ( renderer ) {
		case 'php':
			return 'PHP';
		case 'static':
			return 'Static';
		default:
			return renderer;
	}
};

const toSeverityClass = ( severity: PHPLog[ 'severity' ] ) =>
	severity.split( ' ' )[ 0 ].toLowerCase();

export function useFields( { logType }: { logType: LogType } ): Field< PHPLog | ServerLog >[] {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const siteId = site?.ID as number;

	const { data: gmtOffset } = useSuspenseQuery( {
		...siteSettingsQuery( siteId ),
		select: ( s ) => s?.gmt_offset ?? 0,
	} );

	const locale = useLocale();

	const dateTimeLabel = sprintf(
		/* Translators: %s is the site's GMT offset */
		__( 'Date & time (%s)' ),
		getUtcOffsetDisplay( gmtOffset )
	);

	return useMemo( () => {
		if ( logType === LogType.PHP ) {
			return [
				{
					id: 'timestamp',
					type: 'date',
					label: dateTimeLabel,
					enableHiding: false,
					enableSorting: true,
					getValue: ( { item } ) => ( item as PHPLog ).timestamp,
					render: ( { field, item } ) => (
						<span>
							{ ( field.getValue( { item } ) as string )
								? formatDateWithOffset( field.getValue( { item } ) as string, gmtOffset, locale )
								: '' }
						</span>
					),
				},
				{
					id: 'severity',
					type: 'text',
					label: __( 'Severity' ),
					enableSorting: false,
					elements: VALUES_SEVERITY.map( ( severity ) => ( { value: severity, label: severity } ) ),
					getValue: ( { item } ) => ( item as PHPLog ).severity,
					render: ( { field, item } ) => (
						<Badge
							intent="default"
							className={ `badge--${ toSeverityClass( field.getValue( { item } ) ) }` }
						>
							{ field.getValue( { item } ) }
						</Badge>
					),
				},
				{
					id: 'message',
					type: 'text',
					label: __( 'Message' ),
					enableSorting: false,
					getValue: ( { item } ) => ( item as PHPLog ).message,
					render: ( { field, item } ) => (
						<span className="site-logs-ellipsis">{ String( field.getValue( { item } ) ) }</span>
					),
				},
				{
					id: 'kind',
					type: 'text',
					label: __( 'Group' ),
					enableSorting: false,
					getValue: ( { item } ) => ( item as PHPLog ).kind,
				},
				{
					id: 'name',
					type: 'text',
					label: __( 'Source' ),

					enableSorting: false,
					getValue: ( { item } ) => ( item as PHPLog ).name,
					render: ( { field, item } ) => (
						<span className="site-logs-wrap">{ String( field.getValue( { item } ) ) }</span>
					),
				},
				{
					id: 'file',
					type: 'text',
					label: __( 'File' ),
					enableSorting: false,
					getValue: ( { item } ) => ( item as PHPLog ).file,
					render: ( { field, item } ) => (
						<span className="site-logs-wrap">{ String( field.getValue( { item } ) ) }</span>
					),
				},
				{
					id: 'line',
					type: 'integer',
					label: __( 'Line' ),
					enableSorting: false,
					getValue: ( { item } ) => ( item as PHPLog ).line,
					render: ( { field, item } ) => formatNumber( field.getValue( { item } ) as number ),
				},
			];
		}

		// server (web) logs
		return [
			{
				id: 'date',
				type: 'datetime',
				label: dateTimeLabel,
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item } ) => ( item as PHPLog ).timestamp,
				render: ( { field, item } ) => (
					<span>
						{ formatDateWithOffset( field.getValue( { item } ) as string, gmtOffset, locale ) }
					</span>
				),
			},
			{
				id: 'request_type',
				type: 'text',
				label: __( 'Request type' ),
				enableSorting: false,
				elements: VALUES_REQUEST_TYPE.map( ( t ) => ( { value: t, label: t } ) ),
				getValue: ( { item } ) => ( item as ServerLog ).request_type,
				render: ( { field, item } ) => (
					<Badge intent="default" className={ `badge--${ field.getValue( { item } ) }` }>
						{ field.getValue( { item } ) }
					</Badge>
				),
			},
			{
				id: 'status',
				type: 'text',
				label: __( 'Status' ),
				enableSorting: false,
				elements: VALUES_STATUS.map( ( status ) => ( { value: status, label: status } ) ),
				getValue: ( { item } ) => ( item as ServerLog ).status,
			},
			{
				id: 'request_url',
				type: 'text',
				label: __( 'Request URL' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).request_url,
				render: ( { field, item } ) => (
					<span className="site-logs-wrap">{ String( field.getValue( { item } ) ) }</span>
				),
			},
			{
				id: 'body_bytes_sent',
				type: 'integer',
				label: __( 'Body bytes sent' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).body_bytes_sent,
				render: ( { field, item } ) => (
					<span>{ formatNumber( field.getValue( { item } ) as number ) }</span>
				),
			},
			{
				id: 'cached',
				type: 'text',
				label: __( 'Cached' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).cached,
				elements: VALUES_CACHED.map( ( cachedValue ) => ( {
					value: cachedValue,
					label: getLabelCached( cachedValue ),
				} ) ),
				filterBy: { operators: [ 'isAny' as Operator ] },
				render: ( { field, item } ) => (
					<span>{ getLabelCached( field.getValue( { item } ) as string ) }</span>
				),
			},
			{
				id: 'http_host',
				type: 'text',
				label: __( 'HTTP Host' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).http_host,
			},
			{
				id: 'http_referer',
				type: 'text',
				label: __( 'HTTP Referrer' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).http_referer,
				render: ( { field, item } ) => (
					<span className="site-logs-wrap">{ String( field.getValue( { item } ) ) }</span>
				),
			},
			{
				id: 'http2',
				type: 'text',
				label: __( 'HTTP/2' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).http2,
			},
			{
				id: 'http_user_agent',
				type: 'text',
				label: __( 'User Agent' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).http_user_agent,
			},
			{
				id: 'http_version',
				type: 'text',
				label: __( 'HTTP Version' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).http_version,
			},
			{
				id: 'http_x_forwarded_for',
				type: 'text',
				label: __( 'X-Forwarded-For' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).http_x_forwarded_for,
			},
			{
				id: 'renderer',
				type: 'text',
				label: __( 'Renderer' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).renderer,
				elements: VALUES_RENDERER.map( ( renderer ) => ( {
					value: renderer,
					label: getLabelRenderer( renderer ),
				} ) ),
				filterBy: { operators: [ 'isAny' as Operator ] },
			},
			{
				id: 'request_completion',
				type: 'text',
				label: __( 'Request Completion' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).request_completion,
			},
			{
				id: 'request_time',
				type: 'text',
				label: __( 'Request Time' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).request_time,
			},
			{
				id: 'scheme',
				type: 'text',
				label: __( 'Scheme' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).scheme,
			},
			{
				id: 'timestamp',
				type: 'integer',
				label: __( 'Timestamp' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).timestamp,
			},
			{
				id: 'type',
				type: 'text',
				label: __( 'Type' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).type,
			},
			{
				id: 'user_ip',
				type: 'text',
				label: __( 'User IP' ),
				enableSorting: false,
				getValue: ( { item } ) => ( item as ServerLog ).user_ip,
			},
		];
	}, [ dateTimeLabel, gmtOffset, locale, logType ] );
}
