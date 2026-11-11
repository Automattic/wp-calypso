import { QueryKey } from '@tanstack/react-query';
import { PluginQueryOptions } from './types';

const PLUGINS_CACHE_VERSION = 1;

export const getPluginsListKey = (
	key: QueryKey,
	options: PluginQueryOptions,
	infinite?: boolean
): QueryKey => {
	const keyParams = [
		options.category || '',
		options.searchTerm || '',
		options.pageSize || '',
		options.locale || '',
		options.page || '',
		infinite ? 'infinite' : '',
		options.tag && ! options.searchTerm ? options.tag : '',
	];

	return [ ...key, PLUGINS_CACHE_VERSION.toString(), ...keyParams ];
};
