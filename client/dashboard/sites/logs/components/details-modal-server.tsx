import { Badge } from '@automattic/ui';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { getUtcOffsetDisplay } from '../../../utils/datetime';
import { formatLogDateTimeForDisplay } from '../utils';
import type { ServerLog, ServerData } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';
import './style.scss';

export default function DetailsModalServer( {
	item,
	gmtOffset,
	timezoneString,
}: {
	item: ServerLog;
	gmtOffset: number;
	timezoneString?: string;
} ) {
	const locale = useLocale();
	const offsetDisplay = getUtcOffsetDisplay( gmtOffset );
	const formatted = formatLogDateTimeForDisplay( item.date, gmtOffset, locale, timezoneString );

	const data = {
		date: formatted,
		request_type: item.request_type,
		status: item.status,
		request_url: item.request_url,
		body_bytes_sent: String( item.body_bytes_sent ),
		cached: item.cached,
		http_host: item.http_host,
		http_referer: item.http_referer,
		http2: item.http2,
		http_user_agent: item.http_user_agent,
		http_version: item.http_version,
		http_x_forwarded_for: item.http_x_forwarded_for,
		renderer: item.renderer,
		request_completion: item.request_completion,
		request_time: item.request_time,
		scheme: item.scheme,
		timestamp: String( item.timestamp ),
		type: item.type,
		user_ip: item.user_ip,
	};

	const fields: Field< ServerData >[] = [
		{
			id: 'date',
			label: sprintf(
				/* Translators: %s: UTC offset */
				__( 'Date & Time (%s)' ),
				offsetDisplay
			),
			type: 'text',
			readOnly: true,
		},
		{
			id: 'request_type',
			label: __( 'Request Type' ),
			type: 'text',
			render: ( { item }: { item: ServerData } ) => (
				<Badge intent="default" className={ `badge--${ item.request_type }` }>
					{ item.request_type }
				</Badge>
			),
			readOnly: true,
		},
		{ id: 'status', label: __( 'Status' ), type: 'text', readOnly: true },
		{ id: 'request_url', label: __( 'Request URL' ), type: 'text', readOnly: true },
		{ id: 'body_bytes_sent', label: __( 'Body Bytes Sent' ), type: 'text', readOnly: true },
		{ id: 'cached', label: __( 'Cached' ), type: 'text', readOnly: true },
		{ id: 'http_host', label: __( 'HTTP Host' ), type: 'text', readOnly: true },
		{ id: 'http_referer', label: __( 'HTTP Referrer' ), type: 'text', readOnly: true },
		{ id: 'http2', label: __( 'HTTP/2' ), type: 'text', readOnly: true },
		{ id: 'http_user_agent', label: __( 'User Agent' ), type: 'text', readOnly: true },
		{ id: 'http_version', label: __( 'HTTP Version' ), type: 'text', readOnly: true },
		{ id: 'http_x_forwarded_for', label: __( 'X-Forwarded-For' ), type: 'text', readOnly: true },
		{ id: 'renderer', label: __( 'Renderer' ), type: 'text', readOnly: true },
		{ id: 'request_completion', label: __( 'Request Completion' ), type: 'text', readOnly: true },
		{ id: 'request_time', label: __( 'Request Time' ), type: 'text', readOnly: true },
		{ id: 'scheme', label: __( 'Scheme' ), type: 'text', readOnly: true },
		{ id: 'timestamp', label: __( 'Timestamp' ), type: 'text', readOnly: true },
		{ id: 'type', label: __( 'Type' ), type: 'text', readOnly: true },
		{ id: 'user_ip', label: __( 'User IP' ), type: 'text', readOnly: true },
	];

	return (
		<VStack spacing={ 3 } className="site-logs-details-modal">
			<DataForm
				data={ data }
				fields={ fields }
				form={ {
					fields: fields.map( ( field ) => field.id ),
					layout: {
						type: 'panel',
						labelPosition: 'side',
						openAs: 'dropdown',
					},
				} }
				onChange={ () => {} }
			/>
		</VStack>
	);
}
