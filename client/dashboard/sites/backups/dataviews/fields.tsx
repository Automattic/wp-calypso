import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useFormattedTime } from '../../../components/formatted-time';
import { formatYmd } from '../../../utils/datetime';
import { gridiconToWordPressIcon } from '../../../utils/gridicons';
import type { ActivityLogEntry } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const FormattedTime = ( { timestamp }: { timestamp: string } ) => {
	const formattedTime = useFormattedTime( timestamp, {
		dateStyle: 'medium',
		timeStyle: 'short',
	} );
	return <>{ formattedTime }</>;
};

export function getFields(): Field< ActivityLogEntry >[] {
	return [
		{
			id: 'icon',
			label: __( 'Icon' ),
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
				const actor = item.actor?.name ? ` by ${ item.actor.name }` : '';
				return item.summary + actor;
			},
			enableGlobalSearch: true,
		},
		{
			id: 'date',
			label: __( 'Date' ),
			type: 'date',
			filterBy: {
				operators: [ 'on' ],
			},
			getValue: ( { item } ) => {
				const date = new Date( item.published );
				return formatYmd( date );
			},
			render: ( { item } ) => <FormattedTime timestamp={ item.published } />,
		},
		{
			id: 'content_text',
			label: __( 'Content' ),
			getValue: ( { item } ) => item.content.text,
			enableGlobalSearch: true,
		},
	];
}
