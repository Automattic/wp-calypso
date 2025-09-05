import { __ } from '@wordpress/i18n';
import type { PluginListRow } from '../types';
import type { Field } from '@wordpress/dataviews';

export const sitesCountField: Field< PluginListRow > = {
	id: 'sitesCount',
	label: __( 'Sites' ),
	getValue: ( { item } ) => item.sitesCount,
	enableHiding: false,
	enableSorting: true,
	render: ( { item } ) => String( item.sitesCount ),
};
