/** @format */
/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

export const filterStateToQuery = ( { page, group } ) =>
	Object.assign(
		{},
		page && page > 1 && { page },
		group && ! isEmpty( group.includes ) && { group: group.includes.join( ',' ) }
	);

export const queryToFilterState = query =>
	Object.assign(
		{},
		query.page && query.page > 0 && { page: query.page },
		query.group && {
			group: Object.assign( {}, query.group && { includes: query.group.split( ',' ) } ),
		}
	);

export const optimizeActivityLogUrl = url => {
	return url.split( '%2C' ).join( ',' );
};
