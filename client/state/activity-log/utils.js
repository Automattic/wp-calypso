/** @format */

export const filterStateToApiQuery = filter =>
	Object.assign(
		{},
		filter.action && { action: filter.action },
		filter.on && { on: filter.on },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && { group: filter.group },
		filter.notGroup && { not_group: filter.notGroup },
		filter.name && { name: filter.name },
		{ number: 1000 },
		{ aggregate: true }
	);

export const filterStateToQuery = filter =>
	Object.assign(
		{},
		filter.action && { action: filter.action.join( ',' ) },
		filter.on && { on: filter.on },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && { group: filter.group.join( ',' ) },
		filter.notGroup && { not_group: filter.notGroup.join( ',' ) },
		filter.name && { name: filter.name.join( ',' ) },
		filter.page > 1 && { page: filter.page }
	);

export const queryToFilterState = query =>
	Object.assign(
		{},
		query.action && { action: decodeURI( query.action ).split( ',' ) },
		query.on && { on: query.on },
		query.after && { after: query.after },
		query.before && { before: query.before },
		query.by && { by: query.by },
		query.date_range && { dateRange: query.date_range },
		query.name && { name: decodeURI( query.name ).split( ',' ) },
		query.group && { group: decodeURI( query.group ).split( ',' ) },
		query.not_group && { notGroup: decodeURI( query.not_group ).split( ',' ) },
		query.page && query.page > 0 && { page: query.page }
	);
