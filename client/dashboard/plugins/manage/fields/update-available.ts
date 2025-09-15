import { __ } from '@wordpress/i18n';
import type { PluginListRow } from '../types';
import type { Field } from '@wordpress/dataviews';

export const updateAvailableField: Field< PluginListRow > = {
	id: 'updateAvailable',
	label: __( 'Update Available' ),
	getValue: ( { item } ) => ( [ 'some', 'all' ].includes( item.hasUpdate ) ? 1 : 0 ),
	enableHiding: false,
	enableSorting: true,
	elements: [
		{ value: 1, label: __( 'Yes' ) },
		{ value: 0, label: __( 'No' ) },
	],
	render: ( { item } ) =>
		[ 'some', 'all' ].includes( item.hasUpdate ) ? __( 'Yes' ) : __( 'No' ),
};
