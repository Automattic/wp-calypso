import { Badge } from '@automattic/ui';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { getUtcOffsetDisplay } from '../../../utils/datetime';
import { formatLogDateTimeForDisplay, toSeverityClass } from '../utils';
import type { PHPLog } from '../../../data/site-logs';
import './style.scss';

export default function DetailsModalPHP( {
	item,
	gmtOffset,
	timezoneString,
}: {
	item: PHPLog;
	gmtOffset: number;
	timezoneString?: string;
} ) {
	const locale = useLocale();
	const offsetDisplay = getUtcOffsetDisplay( gmtOffset );
	const formatted = formatLogDateTimeForDisplay(
		item.timestamp,
		gmtOffset,
		locale,
		timezoneString
	);
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
				<Text className="site-logs-details-modal__field-title">{ __( 'Group' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.kind }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Source' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.name }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Severity' ) }</Text>
				<HStack className="site-logs-details-modal__field-value">
					<Badge intent="default" className={ `badge--${ toSeverityClass( item.severity ) }` }>
						{ item.severity }
					</Badge>
				</HStack>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'File' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.file }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Line' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ String( item.line ) }</Text>
			</div>

			<div className="site-logs-details-modal__row">
				<Text className="site-logs-details-modal__field-title">{ __( 'Message' ) }</Text>
				<Text className="site-logs-details-modal__field-value">{ item.message }</Text>
			</div>
		</VStack>
	);
}
