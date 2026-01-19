import { Icon } from '@wordpress/components';
import { plugins as pluginIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { PluginListRow } from '../types';

import './plugin-icon.scss';

const ICON_SIZE = 48;
const FALLBACK_ICON_SIZE = 32;

export const PluginIcon = ( { item }: { item?: PluginListRow } ) => {
	const icon = item?.icon ? (
		<img src={ item.icon } alt={ item.name } width={ ICON_SIZE } height={ ICON_SIZE } />
	) : (
		<Icon icon={ pluginIcon } size={ FALLBACK_ICON_SIZE } className="plugin-icon-fallback" />
	);

	return (
		<div className={ clsx( 'plugin-icon-wrapper', { 'is-fallback': ! item?.icon } ) }>{ icon }</div>
	);
};
