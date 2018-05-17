/** @format */

export const filterStateToQuery = ( { page, group } ) =>
	Object.assign(
		{},
		page && page > 1 && { page },
		group && group.includes && { 'group[]': group.includes }
	);

export const queryToFilterState = query =>
	Object.assign(
		{},
		query.page && query.page > 0 && { page: query.page },
		( query.group || query[ 'group[]' ] ) && {
			group: Object.assign(
				{},
				query.group && { includes: query.group },
				query[ 'group[]' ] && { includes: query[ 'group[]' ] }
			),
		}
	);
