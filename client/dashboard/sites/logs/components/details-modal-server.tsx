import { Badge } from '@automattic/ui';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { getUtcOffsetDisplay } from '../../../utils/datetime';
import { formatLogDateTimeForDisplay } from '../utils';
import type { ServerLog } from '@automattic/api-core';
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
	return (
		<VStack className="site-logs-details-modal" spacing={ 3 }>
			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">
					{ sprintf(
						/* Translators: %s: UTC offset */
						__( 'Date & Time (%s)' ),
						offsetDisplay
					) }
				</Text>
				<Text className="site-logs-details-modal__field-value">{ formatted }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Request Type' ) }</Text>
				<Text className="site-logs-details-modal__field-value">
					<Badge intent="default" className={ `badge--${ item.request_type }` }>
						{ item.request_type }
					</Badge>
				</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Status' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.status }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Request URL' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.request_url }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Body Bytes Sent' ) }</Text>
				<Text className="site-logs-details-modal__field-value">
					{ String( item.body_bytes_sent ) }
				</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Cached' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.cached }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'HTTP Host' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.http_host }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'HTTP Referrer' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.http_referer }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'HTTP/2' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.http2 }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'User Agent' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.http_user_agent }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'HTTP Version' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.http_version }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'X-Forwarded-For' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.http_x_forwarded_for }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Renderer' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.renderer }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Request Completion' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.request_completion }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Request Time' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.request_time }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Scheme' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.scheme }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Timestamp' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ String( item.timestamp ) }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Type' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.type }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'User IP' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.user_ip }</Text>
			</div>
		</VStack>
	);
}
