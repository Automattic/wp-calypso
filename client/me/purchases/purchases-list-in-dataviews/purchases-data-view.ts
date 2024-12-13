export const purchasesDataView = {
	type: 'table',
	search: [ 'blog_id', 'product_id' ],
	filters: [
		{ field: 'blog_id', operator: 'isAny', value: [ '170301410', '170301570', '170301629' ] },
		{ field: 'product_id', operator: 'isAny', value: [ '5', '1009' ] },
	],
	page: 1,
	perPage: 5,
	sort: {
		field: 'product_id',
		direction: 'desc',
	},
	titleField: 'domain',
	fields: [ 'blog_id', 'product_id', 'domain' ],
	layout: {},
} as Object;
