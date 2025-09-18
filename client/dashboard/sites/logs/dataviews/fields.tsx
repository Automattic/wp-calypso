import { LogType, PHPLog, ServerLog, SiteActivityLog } from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { dateI18n } from '@wordpress/date';
import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { useLocale } from '../../../app/locale';
import { formatDateWithOffset, getUtcOffsetDisplay } from '../../../utils/datetime';
import { gridiconToWordPressIcon } from '../../../utils/gridicons';
import type { Field } from '@wordpress/dataviews';

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
}: UseFieldsArgs ): Field< PHPLog >[] | Field< ServerLog >[] | Field< SiteActivityLog >[] {
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
		const formatDateCell = ( value?: string | number, formatAsUTC?: boolean ) => {
			if ( ! value ) {
				return '';
			}
			const dateFormat = 'M j, Y \\a\\t g:i A';
			const date = typeof value === 'number' ? new Date( value * 1000 ) : new Date( value );
			if ( formatAsUTC ) {
				return dateI18n( dateFormat, date, 'UTC' );
			}

			return timezoneString
				? dateI18n( dateFormat, date, timezoneString )
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
					getValue: ( { item } ) => item.timestamp,
					render: ( { item } ) => {
						const value = item.timestamp;
						return <span>{ formatDateCell( value ) }</span>;
					},
					filterBy: { operators: [] },
				},
				{
					id: 'severity',
					type: 'text',
					label: __( 'Severity' ),
					enableSorting: false,
					elements: VALUES_SEVERITY.map( ( severity ) => ( { value: severity, label: severity } ) ),
					getValue: ( { item } ) => item.severity,
					render: ( { item } ) => (
						<Badge intent="default" className={ `badge--${ toSeverityClass( item.severity ) }` }>
							{ item.severity }
						</Badge>
					),
					filterBy: { operators: [ 'isAny' ] },
				},
				{
					id: 'message',
					type: 'text',
					label: __( 'Message' ),
					enableSorting: false,
					getValue: ( { item } ) => item.message,
					render: ( { item } ) => (
						<span className="site-logs-ellipsis">{ String( item.message ) }</span>
					),
					filterBy: { operators: [] },
				},
				{
					id: 'kind',
					type: 'text',
					label: __( 'Group' ),
					enableSorting: false,
					getValue: ( { item } ) => item.kind,
					filterBy: { operators: [] },
				},
				{
					id: 'name',
					type: 'text',
					label: __( 'Source' ),
					enableSorting: false,
					getValue: ( { item } ) => item.name,
					render: ( { item } ) => <span className="site-logs-wrap">{ String( item.name ) }</span>,
					filterBy: { operators: [] },
				},
				{
					id: 'file',
					type: 'text',
					label: __( 'File' ),
					enableSorting: false,
					getValue: ( { item } ) => item.file,
					render: ( { item } ) => <span className="site-logs-wrap">{ String( item.file ) }</span>,
					filterBy: { operators: [] },
				},
				{
					id: 'line',
					type: 'integer',
					label: __( 'Line' ),
					enableSorting: false,
					getValue: ( { item } ) => item.line,
					render: ( { item } ) => formatNumber( item.line ),
					filterBy: { operators: [] },
				},
			] satisfies Field< PHPLog >[];
		}

		if ( logType === LogType.ACTIVITY ) {
			return [
				{
					id: 'published',
					type: 'datetime',
					label: dateTimeLabel,
					enableHiding: false,
					enableSorting: true,
					getValue: ( { item } ) => item.published,
					render: ( { item } ) => {
						const value = item.published;
						return <span>{ formatDateCell( value ) }</span>;
					},
					filterBy: { operators: [] },
				},
				{
					id: 'published_utc',
					type: 'datetime',
					label: __( 'Date & Time (UTC)' ),
					enableHiding: true,
					enableSorting: true,
					getValue: ( { item } ) => item.published,
					render: ( { item } ) => {
						const value = item.published;
						return <span>{ formatDateCell( value, true ) }</span>;
					},
					filterBy: { operators: [] },
				},
				{
					id: 'event',
					type: 'text',
					label: __( 'Event' ),
					enableSorting: false,
					getValue: ( { item } ) => `${ item.summary }: ${ item.content.text }`,
					render: ( { item } ) => (
						<HStack spacing="2" alignment="left" className="site-activity-logs__event">
							{ item.gridicon && (
								<Icon
									className="site-activity-logs__event-icon"
									icon={ gridiconToWordPressIcon( item.gridicon ) }
									size={ 24 }
								/>
							) }
							<strong>{ item.summary }</strong>
							<span>{ item.content.text }</span>
						</HStack>
					),
					filterBy: { operators: [] },
				},
				{
					id: 'actor',
					type: 'text',
					label: __( 'User' ),
					enableSorting: false,
					getValue: ( { item } ) => item.actor?.name || __( 'Unknown' ),
					render: ( { item } ) => <span>{ item.actor?.name || __( 'Unknown' ) }</span>,
					filterBy: { operators: [] },
				},
			] satisfies Field< SiteActivityLog >[];
		}

		// server (web) logs
		return [
			{
				id: 'date',
				type: 'datetime',
				label: dateTimeLabel,
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item } ) => item.date ?? item.timestamp,
				render: ( { item } ) => {
					const value = item.date ?? item.timestamp;
					return <span>{ formatDateCell( value ) }</span>;
				},
				filterBy: { operators: [] },
			},
			{
				id: 'request_type',
				type: 'text',
				label: __( 'Request type' ),
				enableSorting: false,
				elements: VALUES_REQUEST_TYPE.map( ( t ) => ( { value: t, label: t } ) ),
				getValue: ( { item } ) => item.request_type,
				render: ( { item } ) => (
					<Badge intent="default" className={ `badge--${ item.request_type }` }>
						{ item.request_type }
					</Badge>
				),
				filterBy: { operators: [ 'isAny' ] },
			},
			{
				id: 'status',
				type: 'text',
				label: __( 'Status' ),
				enableSorting: false,
				elements: VALUES_STATUS.map( ( status ) => ( { value: status, label: status } ) ),
				getValue: ( { item } ) => item.status,
				filterBy: { operators: [ 'isAny' ] },
			},
			{
				id: 'request_url',
				type: 'text',
				label: __( 'Request URL' ),
				enableSorting: false,
				getValue: ( { item } ) => item.request_url,
				render: ( { item } ) => (
					<span className="site-logs-wrap">{ String( item.request_url ) }</span>
				),
				filterBy: { operators: [] },
			},
			{
				id: 'body_bytes_sent',
				type: 'integer',
				label: __( 'Body bytes sent' ),
				enableSorting: false,
				getValue: ( { item } ) => item.body_bytes_sent,
				render: ( { item } ) => <span>{ formatNumber( item.body_bytes_sent ) }</span>,
				filterBy: { operators: [] },
			},
			{
				id: 'cached',
				type: 'text',
				label: __( 'Cached' ),
				enableSorting: false,
				getValue: ( { item } ) => item.cached,
				elements: VALUES_CACHED.map( ( cachedValue ) => ( {
					value: cachedValue,
					label: getLabelCached( cachedValue ),
				} ) ),
				render: ( { item } ) => <span>{ getLabelCached( item.cached ) }</span>,
				filterBy: { operators: [ 'isAny' ] },
			},
			{
				id: 'http_host',
				type: 'text',
				label: __( 'HTTP Host' ),
				enableSorting: false,
				getValue: ( { item } ) => item.http_host,
				filterBy: { operators: [] },
			},
			{
				id: 'http_referer',
				type: 'text',
				label: __( 'HTTP Referrer' ),
				enableSorting: false,
				getValue: ( { item } ) => item.http_referer,
				render: ( { item } ) => (
					<span className="site-logs-wrap">{ String( item.http_referer ) }</span>
				),
				filterBy: { operators: [] },
			},
			{
				id: 'http2',
				type: 'text',
				label: __( 'HTTP/2' ),
				enableSorting: false,
				getValue: ( { item } ) => item.http2,
				filterBy: { operators: [] },
			},
			{
				id: 'http_user_agent',
				type: 'text',
				label: __( 'User Agent' ),
				enableSorting: false,
				getValue: ( { item } ) => item.http_user_agent,
				filterBy: { operators: [] },
			},
			{
				id: 'http_version',
				type: 'text',
				label: __( 'HTTP Version' ),
				enableSorting: false,
				getValue: ( { item } ) => item.http_version,
				filterBy: { operators: [] },
			},
			{
				id: 'http_x_forwarded_for',
				type: 'text',
				label: __( 'X-Forwarded-For' ),
				enableSorting: false,
				getValue: ( { item } ) => item.http_x_forwarded_for,
				filterBy: { operators: [] },
			},
			{
				id: 'renderer',
				type: 'text',
				label: __( 'Renderer' ),
				enableSorting: false,
				getValue: ( { item } ) => item.renderer,
				elements: VALUES_RENDERER.map( ( renderer ) => ( {
					value: renderer,
					label: getLabelRenderer( renderer ),
				} ) ),
				filterBy: { operators: [ 'isAny' ] },
			},
			{
				id: 'request_completion',
				type: 'text',
				label: __( 'Request Completion' ),
				enableSorting: false,
				getValue: ( { item } ) => item.request_completion,
				filterBy: { operators: [] },
			},
			{
				id: 'request_time',
				type: 'text',
				label: __( 'Request Time' ),
				enableSorting: false,
				getValue: ( { item } ) => item.request_time,
				filterBy: { operators: [] },
			},
			{
				id: 'scheme',
				type: 'text',
				label: __( 'Scheme' ),
				enableSorting: false,
				getValue: ( { item } ) => item.scheme,
				filterBy: { operators: [] },
			},
			{
				id: 'timestamp',
				type: 'integer',
				label: __( 'Timestamp' ),
				enableSorting: false,
				getValue: ( { item } ) => item.timestamp,
				filterBy: { operators: [] },
			},
			{
				id: 'type',
				type: 'text',
				label: __( 'Type' ),
				enableSorting: false,
				getValue: ( { item } ) => item.type,
				filterBy: { operators: [] },
			},
			{
				id: 'user_ip',
				type: 'text',
				label: __( 'User IP' ),
				enableSorting: false,
				getValue: ( { item } ) => item.user_ip,
				filterBy: { operators: [] },
			},
		] satisfies Field< ServerLog >[];
	}, [ dateTimeLabel, gmtOffset, locale, logType, timezoneString ] );
}
