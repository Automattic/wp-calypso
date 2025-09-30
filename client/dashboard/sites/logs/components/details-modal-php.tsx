import { Badge } from '@automattic/ui';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { getUtcOffsetDisplay } from '../../../utils/datetime';
import { formatLogDateTimeForDisplay, toSeverityClass } from '../utils';
import type { PHPLog } from '@automattic/api-core';
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

	const data = {
		date_time: formatted,
		group: item.kind,
		source: item.name,
		severity: item.severity,
		file: item.file,
		line: String( item.line ),
		message: item.message,
	};

	const fields = [
		{
			id: 'date_time',
			label: sprintf(
				/* Translators: %s: UTC offset */
				__( 'Date & Time (%s)' ),
				offsetDisplay
			),
			type: 'text',
			readOnly: true,
		},
		{
			id: 'group',
			label: __( 'Group' ),
			type: 'text',
			readOnly: true,
		},
		{
			id: 'source',
			label: __( 'Source' ),
			type: 'text',
			readOnly: true,
		},
		{
			id: 'severity',
			label: __( 'Severity' ),
			type: 'text',
			render: ( { item } ) => (
				<Badge intent="default" className={ `badge--${ toSeverityClass( item.severity ) }` }>
					{ item.severity }
				</Badge>
			),
			readOnly: true,
		},
		{
			id: 'file',
			label: __( 'File' ),
			type: 'text',
			readOnly: true,
		},
		{
			id: 'line',
			label: __( 'Line' ),
			type: 'text',
			readOnly: true,
		},
		{
			id: 'message',
			label: __( 'Message' ),
			type: 'text',
			readOnly: true,
		},
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
						labelPosition: 'default',
						openAs: 'dropdown',
					},
				} }
				onChange={ () => {} }
			/>
		</VStack>
	);
}
