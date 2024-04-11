export function getSitesPagination( allSites, page, perPage ) {
	const paginatedSites = allSites.slice( ( page - 1 ) * perPage, page * perPage );
	const totalItems = allSites.length;
	const totalPages = Math.ceil( totalItems / perPage );

	return { paginatedSites, totalItems, totalPages };
}
