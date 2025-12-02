import { Link } from '@tanstack/react-router';
import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plugins } from '@wordpress/icons';
import clsx from 'clsx';
import { pluginRoute } from '../../../app/router/plugins';
import type { PluginListRow } from '../types';
import type { Field } from '@wordpress/dataviews';

const ICON_SIZE = 32;
const FALLBACK_ICON_SIZE = 24;

export const nameField: Field< PluginListRow > = {
	id: 'name',
	label: __( 'Plugin' ),
	enableHiding: false,
	enableSorting: true,
	getValue: ( { item } ) => item.name,
	render: ( { item, field } ) => {
		const icon = item.icon ? (
			<img src={ item.icon } alt={ item.name } width={ ICON_SIZE } height={ ICON_SIZE } />
		) : (
			<Icon icon={ plugins } size={ FALLBACK_ICON_SIZE } className="plugin-icon-fallback" />
		);

		return (
			<HStack spacing={ 2 } justify="flex-start">
				<div className={ clsx( 'plugin-icon-wrapper', { 'is-fallback': ! item.icon } ) }>
					{ icon }
				</div>
				<Link
					to={ pluginRoute.to }
					params={ { pluginId: item.slug } }
					dangerouslySetInnerHTML={ { __html: field.getValue( { item } ) } }
				/>
			</HStack>
		);
	},
	enableGlobalSearch: true,
};
