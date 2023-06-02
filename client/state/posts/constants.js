export const DEFAULT_POST_QUERY = {
	context: 'display',
	http_envelope: false,
	pretty: false,
	number: 20,
	offset: 0,
	page: 1,
	order: 'DESC',
	order_by: 'date',
	type: 'post',
	status: 'publish',
	sticky: 'include',
	search: '',
};

// All post statuses displayed in Calypso.
export const POST_STATUSES = [ 'publish', 'draft', 'pending', 'private', 'future', 'trash' ];
