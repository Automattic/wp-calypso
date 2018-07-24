/** @format */

export const filterStateToApiQuery = filter =>
	Object.assign(
		{},
		filter.action && { action: filter.action },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && filter.group.includes && { group: filter.group.includes },
		filter.group && filter.group.excludes && { not_group: filter.group.excludes },
		filter.name && { name: filter.name },
		{ number: 1000 }
	);

export const filterStateToQuery = filter =>
	Object.assign(
		{},
		filter.action && { action: filter.action.join( ',' ) },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && filter.group.includes && { group: filter.group.includes.join( ',' ) },
		filter.group && filter.group.excludes && { not_group: filter.group.excludes( ',' ) },
		filter.name && { name: filter.name.join( ',' ) },
		filter.page > 1 && { page: filter.page }
	);

export const queryToFilterState = query => {
	const hasGroup = query.group || query.not_group;
	const {
		action,
		after,
		before,
		by,
		date_range: dateRange,
		group,
		name,
		not_group: notGroup,
		page,
	} = query;
	// helper to fold in new properties conditionally
	const p = ( ...o ) => Object.assign( {}, ...o );

	return p(
		action && { action: decodeURI( action ).split( ',' ) },
		after && { after },
		before && { before },
		by && { by }, // and a sweet one at that
		dateRange && { dateRange },
		name && { name: decodeURI( name ).split( ',' ) },
		hasGroup && {
			group: p(
				group && { includes: decodeURI( group ).split( ',' ) },
				notGroup && { excludes: decodeURI( notGroup ).split( ',' ) }
			),
		},
		page && page > 0 && { page }
	);
};
