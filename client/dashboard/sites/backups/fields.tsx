import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import type { ActivityLogEntry } from '../../data/types';
import type { Field } from '@wordpress/dataviews';

export function getFields(): Field< ActivityLogEntry >[] {
	return [
		{
			id: 'date',
			label: __( 'Date' ),
			render: ( { item } ) => (
				<>
					<strong>{ dateI18n( 'F j, Y', item.published ) }</strong>
					&nbsp;
					{ dateI18n( 'g:i A', item.published ) }
				</>
			),
		},
		{
			id: 'action',
			label: __( 'Action' ),
			getValue: ( { item } ) => `${ item.summary }: ${ item.content.text }`,
			render: ( { item } ) => (
				<>
					<strong>{ item.summary }</strong>: { item.content.text }
				</>
			),
			enableGlobalSearch: true,
		},
		{
			id: 'user',
			label: __( 'User' ),
			getValue: ( { item } ) => item.actor.name,
		},
	];
}
