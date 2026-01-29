import type { Filter } from '@wordpress/dataviews';

export const extractActivityLogTypeValues = ( filters: Filter[] ): string[] => {
	const filter = filters.find( ( item ) => item.field === 'activity_type' );
	if ( ! filter ) {
		return [];
	}
	const { value } = filter;
	if ( Array.isArray( value ) ) {
		return value.filter( ( item ): item is string => typeof item === 'string' && item.length > 0 );
	}
	if ( typeof value === 'string' && value.length > 0 ) {
		return [ value ];
	}
	return [];
};
