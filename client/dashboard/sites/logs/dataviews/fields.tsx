import { LogType, PHPLog, ServerLog } from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { TextControl } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../../app/locale';
import {
	formatDateCell,
	getDateTimeLabel,
	toRequestTypeIntent,
	toSeverityIntent,
} from '../../logs/utils';
import {
	VALUES_CACHED,
	VALUES_RENDERER,
	VALUES_REQUEST_TYPE,
	VALUES_SEVERITY,
	VALUES_STATUS,
} from './constants';
import type {
	Field,
	Operator,
	DataViewRenderFieldProps,
	DataFormControlProps,
} from '@wordpress/dataviews';

import './style.scss';

/**
 * Applying a filter restarts the logs query, which swaps the table for a spinner and
 * takes this input down with it. The stock text control reports every keystroke, so
 * the field would vanish after the first character; hold a draft and commit it once.
 */
function LogsFilterTextEdit( {
	data,
	field,
	onChange,
	hideLabelFromVision,
}: DataFormControlProps< ServerLog > ) {
	const value = String( field.getValue( { item: data } ) ?? '' );
	const [ draft, setDraft ] = useState( value );

	useEffect( () => setDraft( value ), [ value ] );

	const commit = () => {
		if ( draft !== value ) {
			onChange( field.setValue( { item: data, value: draft } ) );
		}
	};

	return (
		<TextControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ field.label }
			hideLabelFromVision={ hideLabelFromVision }
			help={ __( 'Press Enter to apply.' ) }
			value={ draft }
			onChange={ setDraft }
			onKeyDown={ ( event: React.KeyboardEvent ) => {
				// Enter also confirms a character being composed with an IME, and Safari
				// reports that as keyCode 229 rather than through isComposing.
				const isComposing = event.nativeEvent.isComposing || event.keyCode === 229;
				if ( event.key === 'Enter' && ! isComposing ) {
					commit();
				}
			} }
		/>
	);
}

type UseFieldsArgs =
	| { logType: LogType; timezoneString: string; gmtOffset?: number }
	| { logType: LogType; timezoneString?: undefined; gmtOffset: number };

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

export function useFields( {
	logType,
	timezoneString,
	gmtOffset,
}: UseFieldsArgs ): Field< PHPLog >[] | Field< ServerLog >[] {
	const locale = useLocale();

	const isLargeScreen = useViewportMatch( 'huge', '>=' );
	const dateTimeLabel = getDateTimeLabel( { timezoneString, gmtOffset, isLargeScreen } );

	return useMemo( () => {
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
						return <span>{ formatDateCell( { value, timezoneString, gmtOffset, locale } ) }</span>;
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
						<Badge intent={ toSeverityIntent( item.severity ) }>{ item.severity }</Badge>
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
					return <span>{ formatDateCell( { value, timezoneString, gmtOffset, locale } ) }</span>;
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
					<Badge intent={ toRequestTypeIntent( item.request_type ) }>{ item.request_type }</Badge>
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
				Edit: LogsFilterTextEdit,
				label: __( 'Request URL' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.request_url,
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => (
					<span className="site-logs-wrap">{ String( item.request_url ) }</span>
				),
				filterBy: { operators: [ 'is' as Operator ] },
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
				label: __( 'HTTP host' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http_host,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'http_referer',
				type: 'text',
				label: __( 'HTTP referrer' ),
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
				label: __( 'User agent' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.http_user_agent,
				render: ( { item }: DataViewRenderFieldProps< ServerLog > ) => (
					<span className="site-logs-wrap">{ String( item.http_user_agent ) }</span>
				),
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'http_version',
				type: 'text',
				label: __( 'HTTP version' ),
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
				label: __( 'Request completion' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.request_completion,
				filterBy: { operators: [] as Operator[] },
			},
			{
				id: 'request_time',
				type: 'text',
				label: __( 'Request time' ),
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
				Edit: LogsFilterTextEdit,
				label: __( 'User IP' ),
				enableSorting: false,
				getValue: ( { item }: { item: ServerLog } ) => item.user_ip,
				filterBy: { operators: [ 'is' as Operator ] },
			},
		] satisfies Field< ServerLog >[];
	}, [ dateTimeLabel, gmtOffset, locale, logType, timezoneString ] );
}
