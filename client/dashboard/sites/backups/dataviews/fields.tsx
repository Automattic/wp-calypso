import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useFormattedTime } from '../../../components/formatted-time';
import { gridiconToWordPressIcon } from '../../../utils/gridicons';
import type { ActivityLogEntry } from '../../../data/types';
import type { Field } from '@wordpress/dataviews';

const FormattedTime = ( { timestamp }: { timestamp: string } ) => {
	const formattedTime = useFormattedTime( timestamp, {
		dateStyle: 'long',
		timeStyle: 'short',
	} );
	return <strong>{ formattedTime }</strong>;
};

export function getFields(): Field< ActivityLogEntry >[] {
	return [
		{
			id: 'date',
			label: __( 'Date' ),
			getValue: ( { item } ) => item.published,
			render: ( { item } ) => <FormattedTime timestamp={ item.published } />,
		},
		{
			id: 'action',
			label: __( 'Action' ),
			getValue: ( { item } ) => `${ item.summary }: ${ item.content.text }`,
			render: ( { item } ) => (
				<>
					<Icon icon={ gridiconToWordPressIcon( item.gridicon ) } />
					&nbsp;
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
