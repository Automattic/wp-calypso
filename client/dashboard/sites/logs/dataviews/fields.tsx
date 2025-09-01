import { LogType, PHPLog, ServerLog } from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useViewportMatch } from '@wordpress/compose';
import { dateI18n } from '@wordpress/date';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { formatDateWithOffset, getUtcOffsetDisplay } from '../../../utils/datetime';
import type { Field, Operator, DataViewRenderFieldProps } from '@wordpress/dataviews';

import './style.scss';

type UseFieldsArgs =
	| { logType: LogType; timezoneString: string; gmtOffset?: number }
	| { logType: LogType; timezoneString?: undefined; gmtOffset: number };

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

export function useFields( {
	logType,
	timezoneString,
	gmtOffset,
}: UseFieldsArgs ): Field< PHPLog >[] | Field< ServerLog >[] {
	const locale = useLocale();

	let dateTimeLabel = __( 'Date & time' );

	const isLargeScreen = useViewportMatch( 'huge', '>=' );

	/* translators: %s is the site's timezone (e.g., "Europe/London") or UTC offset (e.g., "UTC+02:00") */
	const dateTimeWithTz = __( 'Date & time (%s)' );
	if ( timezoneString && isLargeScreen ) {
		dateTimeLabel = sprintf( dateTimeWithTz, timezoneString );
	} else if ( typeof gmtOffset === 'number' ) {
		dateTimeLabel = sprintf( dateTimeWithTz, getUtcOffsetDisplay( gmtOffset ) );
	}

	return useMemo( () => {
		const formatCell = ( value?: string | number ) => {
			if ( ! value ) {
				return '';
			}
			const date = typeof value === 'number' ? new Date( value * 1000 ) : new Date( value );
			return timezoneString
				? dateI18n( 'M j, Y \\a\\t g:i A', date, timezoneString )
				: formatDateWithOffset( date, gmtOffset as number, locale, {
						dateStyle: 'medium',
						timeStyle: 'short',
				  } );
		};

		if ( logType === LogType.PHP ) {
			return [
				{
					id: 'timestamp',
					type: 'date',
					label: dateTimeLabel,
					enableHiding: false,
					enableSorting: true,
					getValue: ( { item }: { item: PHPLog } ) => item.timestamp,
					render: ( { item }: DataViewRenderFieldProps< PHPLog > ) => {
						const value = item.timestamp;
						return <span>{ formatCell( value ) }</span>;
					},
					filterBy: { operators: [] as Operator[] },
				},
				{
					id: 'severity',
					type: 'text',
					label: __( 'Severity' ),
					enableSorting: false,
					elements: VALUES_SEVERITY.map( ( severity ) => ( { value: severity, label: severity } ) ),
					getValue: ( { item }: { item: PHPLog } ) => item.severity,
					render: ( { item }: DataViewRenderFieldProps< PHPLog > ) => (
						<Badge intent="default" className={ `badge--${ toSeverityClass( item.severity ) }` }>
							{ item.severity }
						</Badge>
					),
					filterBy: { operators: [ 'isAny' as Operator ] },
				},
				{
					id: 'message',
					type: 'text',
					label: __( 'Message' ),
					enableSorting: false,
					getValue: ( { item }: { item: PHPLog } ) => item.message,
					render: ( { item }: DataViewRenderFieldProps< PHPLog > ) => (
						<span className="site-logs-ellipsis">{ String( item.message ) }</span>
					),
					filterBy: { operators: [] as Operator[] },
				},
				{
					id: 'kind',
					type: 'text',
					label: __( 'Group' ),
					enableSorting: false,
					getValue: ( { item }: { item: PHPLog } ) => item.kind,
					filterBy: { operators: [] as Operator[] },
				},
				{
					id: 'name',
					type: 'text',
					label: __( 'Source' ),
					enableSorting: false,
					getValue: ( { item }: { item: PHPLog } ) => item.name,
					render: ( { item }: DataViewRenderFieldProps< PHPLog > ) => (
						<span className="site-logs-wrap">{ String( item.name ) }</span>
					),
					filterBy: { operators: [] as Operator[] },
				},
				{
					id: 'file',
					type: 'text',
					label: __( 'File' ),
					enableSorting: false,
					getValue: ( { item }: { item: PHPLog } ) => item.file,
					render: ( { item }: DataViewRenderFieldProps< PHPLog > ) => (
						<span className="site-logs-wrap">{ String( item.file ) }</span>
					),
					filterBy: { operators: [] as Operator[] },
				},
				{
					id: 'line',
					type: 'integer',
					label: __( 'Line' ),
					enableSorting: false,
					getValue: ( { item }: { item: PHPLog } ) => item.line,
					render: ( { item }: DataViewRenderFieldProps< PHPLog > ) => formatNumber( item.line ),
					filterBy: { operators: [] as Operator[] },
				},
			] satisfies Field< PHPLog >[];
		}

		// server (web) logs
		return [
			{
				id: 'date',
				type: 'datetime',
				label: dateTimeLabel,
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: ServerLog } ) => item.date ?? item.timestamp,
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => {
					const value = item.date ?? item.timestamp;
					return <span>{ formatCell( value ) }</span>;
				},
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'request_type',
				type: 'text',
				label: __( 'Request type' ),
				enableSorting: false,
				elements: VALUES_REQUEST_TYPE.map( ( t ) => ( { value: t, label: t } ) ),
				getValue: ( { item }: { item: ServerLog } ) => item.request_type,
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => (
					<Badge intent="default" className={ `badge--${ item.request_type }` }>
						{ item.request_type }
					</Badge>
				),
				filterBy: { operators: [ 'isAny' as Operator ] },
			},
			{
				id: 'status',
				type: 'text',
				label: __( 'Status' ),
				enableSorting: false,
				elements: VALUES_STATUS.map( ( status ) => ( { value: status, label: status } ) ),
				getValue: ( { item }: { item: ServerLog } ) => item.status,
				filterBy: { operators: [ 'isAny' as Operator ] },
			},
			{
				id: 'request_url',
				type: 'text',
				label: __( 'Request URL' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.request_url,
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => (
					<span className="site-logs-wrap">{ String( item.request_url ) }</span>
				),
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'body_bytes_sent',
				type: 'integer',
				label: __( 'Body bytes sent' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.body_bytes_sent,
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => (
					<span>{ formatNumber( item.body_bytes_sent ) }</span>
				),
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'cached',
				type: 'text',
				label: __( 'Cached' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.cached,
				elements: VALUES_CACHED.map( ( cachedValue ) => ( {
					value: cachedValue,
					label: getLabelCached( cachedValue ),
				} ) ),
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => (
					<span>{ getLabelCached( item.cached ) }</span>
				),
				filterBy: { operators: [ 'isAny' as Operator ] },
			},
			{
				id: 'http_host',
				type: 'text',
				label: __( 'HTTP Host' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http_host,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'http_referer',
				type: 'text',
				label: __( 'HTTP Referrer' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http_referer,
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => (
					<span className="site-logs-wrap">{ String( item.http_referer ) }</span>
				),
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'http2',
				type: 'text',
				label: __( 'HTTP/2' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http2,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'http_user_agent',
				type: 'text',
				label: __( 'User Agent' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http_user_agent,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'http_version',
				type: 'text',
				label: __( 'HTTP Version' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http_version,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'http_x_forwarded_for',
				type: 'text',
				label: __( 'X-Forwarded-For' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http_x_forwarded_for,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'renderer',
				type: 'text',
				label: __( 'Renderer' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.renderer,
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
				getValue: ( { item }: { item: ServerLog } ) => item.request_completion,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'request_time',
				type: 'text',
				label: __( 'Request Time' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.request_time,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'scheme',
				type: 'text',
				label: __( 'Scheme' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.scheme,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'timestamp',
				type: 'integer',
				label: __( 'Timestamp' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.timestamp,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'type',
				type: 'text',
				label: __( 'Type' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.type,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'user_ip',
				type: 'text',
				label: __( 'User IP' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.user_ip,
				filterBy: { operators: [] as Operator[] },
			},
		] satisfies Field< ServerLog >[];
	}, [ dateTimeLabel, gmtOffset, locale, logType, timezoneString ] );
}
