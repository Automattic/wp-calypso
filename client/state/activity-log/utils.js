/** @format */

export const filterStateToApiQuery = filter =>
	Object.assign(
		{},
		{ number: 1000 },
		filter.group && filter.group.includes && { group: filter.group.includes }
	);

export const filterStateToQuery = filter =>
	Object.assign(
		{},
		filter.page > 1 && { page: filter.page },
		filter.group && filter.group.includes && { group: filter.group.includes.join( ',' ) }
	);

export const queryToFilterState = query =>
	Object.assign(
		{},
		query.page && query.page > 0 && { page: query.page },
		query.group && {
			group: Object.assign( {}, { includes: decodeURI( query.group ).split( ',' ) } ),
		}
	);
