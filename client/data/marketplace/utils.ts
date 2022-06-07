import { QueryKey } from 'react-query';
import { PluginQueryOptions } from './types';

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

	return [ key, ...keyParams ];
};
