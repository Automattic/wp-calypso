import { __ } from '@wordpress/i18n';
import type { PluginListRow } from '../types';
import type { Field } from '@wordpress/dataviews';

export const nameField: Field< PluginListRow > = {
	id: 'name',
	label: __( 'Plugin' ),
	enableHiding: false,
	enableSorting: true,
	getValue: ( { item } ) => item.name,
	render: ( { item } ) => item.name,
};
