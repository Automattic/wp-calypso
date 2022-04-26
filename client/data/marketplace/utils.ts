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
	];
	if ( infinite ) {
		keyParams.push( 'infinite' );
	} else {
		keyParams.push( options.page || '' );
	}
	if ( options.tag && ! options.searchTerm ) {
		keyParams.push( options.tag );
	}
	return [ key, ...keyParams ];
};
