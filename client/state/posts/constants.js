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
	search: ''
};

export const DEFAULT_NEW_POST_VALUES = {
	title: '',
	content: '',
	publicize: true,
	status: 'draft',
	sticky: false,
	password: '',
	type: 'post',
	parent: 0,
	format: 'default'
};
