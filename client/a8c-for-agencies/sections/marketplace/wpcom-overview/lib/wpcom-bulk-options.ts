// FIXME we should fetch the discount bracket from a proper source when ready.
const wpcomBulkOptions = [
	{
		value: 1,
		label: '1',
		discount: 0,
	},
	{
		value: 3,
		label: '3',
		sub: '4%',
		discount: 0.04,
	},
	{
		value: 5,
		label: '5',
		sub: '8%',
		discount: 0.08,
	},
	{
		value: 10,
		label: '10',
		sub: '20%',
		discount: 0.2,
	},
	{
		value: 20,
		label: '20',
		sub: '40%',
		discount: 0.4,
	},
	{
		value: 50,
		label: '50',
		sub: '70%',
		discount: 0.7,
	},
	{
		value: 100,
		label: '100',
		sub: '80%',
		discount: 0.8,
	},
];

export default wpcomBulkOptions;
