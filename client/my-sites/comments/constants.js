// Maximum number of comments that will be shown per page.
export const COMMENTS_PER_PAGE = 20;

// Allowed values for comments list sort order.
// Currently the sorting is done by comparing the values of comment IDs,
// and relying on the fact that more recent comments have higher ID values.
export const NEWEST_FIRST = 'desc';
export const OLDEST_FIRST = 'asc';
