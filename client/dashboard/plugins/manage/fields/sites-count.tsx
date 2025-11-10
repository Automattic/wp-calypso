import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { pluginRoute } from '../../../app/router/plugins';
import type { PluginListRow } from '../types';
import type { Field } from '@wordpress/dataviews';

export const sitesCountField: Field< PluginListRow > = {
	id: 'sitesCount',
	label: __( 'Sites' ),
	getValue: ( { item } ) => item.sitesCount,
	enableHiding: false,
	enableSorting: true,
	render: ( { item } ) => (
		<Link to={ pluginRoute.to } params={ { pluginId: item.slug } }>
			{ String( item.sitesCount ) }
		</Link>
	),
};
