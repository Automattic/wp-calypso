export const purchasesDataFields = [
	{
		id: 'site',
		label: 'Site',
		type: 'text',
		width: '100%',
		enableGlobalSearch: true,
		enableSorting: true,
		enableHiding: false,
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		getValue: ( { item }: { item: Purchase } ) => {
			return item.siteId;
		},
		render: ( { item }: { item: Purchase } ) => {
			return <div>{ item.siteId }</div>;
		},
	},
	// {
	// 	id: 'purchases',
	// 	label: 'Product',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'status',
	// 	label: 'Status',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'payment-method',
	// 	label: 'Payment method',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'blog_id',
	// 	label: 'Blog ID',
	// 	enableHiding: false,
	// },
	// {
	// 	id: 'product_id',
	// 	label: 'Product ID',
	// 	enableHiding: true,
	// },
	// {
	// 	id: 'domain',
	// 	label: 'Domain',
	// 	enableHiding: true,
	// },
] as Object[];
