import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { pluginRoute } from '../../../app/router/plugins';
import type { PluginListRow } from '../types';
import type { Field } from '@wordpress/dataviews';

export const nameField: Field< PluginListRow > = {
	id: 'name',
	label: __( 'Plugin' ),
	enableHiding: false,
	enableSorting: true,
	getValue: ( { item } ) => item.name,
	render: ( { item, field } ) => (
		<Link to={ pluginRoute.to } params={ { pluginId: item.slug } }>
			{ field.getValue( { item } ) }
		</Link>
	),
	enableGlobalSearch: true,
};
