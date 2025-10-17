import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { FormattedTime } from '../../../components/formatted-time';
import { gridiconToWordPressIcon } from '../../../utils/gridicons';
import type { ActivityLogEntry } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export function getFields(
	timezoneString?: string,
	gmtOffset?: number
): Field< ActivityLogEntry >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
			enableSorting: false,
			render: ( { item } ) => (
				<Icon
					icon={ gridiconToWordPressIcon( item.gridicon ) }
					size={ 32 }
					className="dashboard-backups__list-icon"
				/>
			),
		},
		{
			id: 'title',
			label: __( 'Title' ),
			getValue: ( { item } ) => {
				// translators: %s is the name of the person who performed the action
				const actor = item.actor?.name ? ` ${ sprintf( __( 'by %s' ), item.actor.name ) }` : '';
				return item.summary + actor;
			},
			enableGlobalSearch: true,
		},
		{
			id: 'date',
			label: __( 'Date' ),
			getValue: ( { item } ) => {
				return item.published || item.last_published;
			},
			render: ( { item } ) => (
				<FormattedTime
					timestamp={ item.published || item.last_published }
					timezoneString={ timezoneString }
					gmtOffset={ gmtOffset }
				/>
			),
		},
		{
			id: 'content_text',
			label: __( 'Content' ),
			getValue: ( { item } ) => item.content.text,
			enableGlobalSearch: true,
		},
	];
}
