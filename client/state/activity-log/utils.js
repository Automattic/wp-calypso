export const filterStateToApiQuery = ( filter, addAggregate = true ) => {
	return Object.assign(
		{},
		// by default, we'll tell the api to create aggregate events
		addAggregate && { aggregate: filter.aggregate ?? true },
		filter.action && { action: filter.action },
		filter.on && { on: filter.on },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && { group: filter.group },
		filter.notGroup && { not_group: filter.notGroup },
		filter.name && { name: filter.name },
		{ number: filter.number > 0 ? filter.number : 1000 },
		filter.sortOrder && { sort_order: filter.sortOrder },
		filter.textSearch && { text_search: filter.textSearch }
	);
};

export const filterStateToQuery = ( filter ) =>
	Object.assign(
		{},
		filter.action && { action: filter.action.join( ',' ) },
		typeof filter.aggregate !== 'undefined' && { aggregate: filter.aggregate },
		filter.backButton && { back_button: true },
		filter.on && { on: filter.on },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && { group: filter.group.join( ',' ) },
		filter.notGroup && { not_group: filter.notGroup.join( ',' ) },
		filter.name && { name: filter.name.join( ',' ) },
		filter.page > 1 && { page: filter.page },
		filter.textSearch && { text_search: filter.textSearch }
	);

export const queryToFilterState = ( query ) =>
	Object.assign(
		{},
		query.action && { action: decodeURI( query.action ).split( ',' ) },
		typeof query.aggregate !== 'undefined' && { aggregate: query.aggregate },
		query.on && { on: query.on },
		query.after && { after: query.after },
		query.before && { before: query.before },
		query.by && { by: query.by },
		query.date_range && { dateRange: query.date_range },
		query.name && { name: decodeURI( query.name ).split( ',' ) },
		query.group && { group: decodeURI( query.group ).split( ',' ) },
		query.not_group && { notGroup: decodeURI( query.not_group ).split( ',' ) },
		query.page && query.page > 0 && { page: query.page },
		query.back_button && { backButton: true },
		query.text_search && { textSearch: query.text_search }
	);
