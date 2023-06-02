import { Icon, currencyDollar, shipping, percent } from '@wordpress/icons';
import { translate } from 'i18n-calypso';

const sparkWidgetList1 = [
	{
		key: 'products',
		title: translate( 'Products Purchased' ),
		format: 'number',
	},
	{
		key: 'avg_products_per_order',
		title: translate( 'Products Per Order' ),
		format: 'number',
	},
	{
		key: 'coupons',
		title: translate( 'Coupons Used' ),
		format: 'number',
	},
];

const sparkWidgetList2 = [
	{
		key: 'total_refund',
		title: translate( 'Refunds' ),
		format: 'currency',
	},
	{
		key: 'total_shipping',
		title: translate( 'Shipping' ),
		format: 'currency',
	},
	{
		key: 'total_tax',
		title: translate( 'Tax' ),
		format: 'currency',
	},
];

export const sparkWidgets = [ sparkWidgetList1, sparkWidgetList2 ];

export const topProducts = {
	basePath: '/store/stats/products',
	title: translate( 'Most Popular Products' ),
	values: [
		{ key: 'name', title: translate( 'Title' ), format: 'text' },
		{ key: 'quantity', title: translate( 'Quantity' ), format: 'number' },
		{ key: 'total', title: translate( 'Sales' ), format: 'currency' },
	],
	empty: translate( 'No products found' ),
	statType: 'statsTopEarners',
};

export const topCategories = {
	basePath: '/store/stats/categories',
	title: translate( 'Top Categories' ),
	values: [
		{ key: 'name', title: translate( 'Title' ), format: 'text' },
		{ key: 'quantity', title: translate( 'Quantity' ), format: 'number' },
		{ key: 'total', title: translate( 'Total' ), format: 'currency' },
	],
	empty: translate( 'No categories found' ),
	statType: 'statsTopCategories',
};

export const topCoupons = {
	basePath: '/store/stats/coupons',
	title: translate( 'Most Used Coupons' ),
	values: [
		{ key: 'name', title: translate( 'Title' ), format: 'text' },
		{ key: 'quantity', title: translate( 'Quantity' ), format: 'number' },
		{ key: 'total', title: translate( 'Total' ), format: 'currency' },
	],
	empty: translate( 'No coupons found' ),
	statType: 'statsTopCoupons',
};

export const UNITS = {
	day: {
		quantity: 30,
		label: 'days',
		durationFn: 'asDays',
		format: 'YYYY-MM-DD',
		shortFormat: 'MMM D',
		chartFormat: 'labelDay',
		title: translate( 'Days' ),
	},
	week: {
		quantity: 30,
		label: 'weeks',
		durationFn: 'asWeeks',
		format: 'YYYY-[W]WW',
		shortFormat: 'MMM D',
		chartFormat: 'labelWeek',
		title: translate( 'Weeks' ),
	},
	month: {
		quantity: 12,
		label: 'months',
		durationFn: 'asMonths',
		format: 'YYYY-MM',
		shortFormat: "MMM [']YY",
		chartFormat: 'labelMonth',
		title: translate( 'Months' ),
	},
	year: {
		quantity: 10,
		label: 'years',
		durationFn: 'asYears',
		format: 'YYYY',
		shortFormat: 'YYYY',
		chartFormat: 'labelYear',
		title: translate( 'Years' ),
	},
};

export const chartTabs = [
	{
		label: translate( 'Gross Sales' ),
		attr: 'gross_sales',
		type: 'currency',
		tabLabel: translate( 'Gross Sales' ),
		availableCharts: [ 'net_sales' ],
		icon: (
			<svg
				className="gridicon"
				width="25"
				height="25"
				viewBox="0 0 25 25"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M6 10V8H19V10H6ZM6 13V17H19V13H6ZM4.5 7.5C4.5 6.94772 4.94772 6.5 5.5 6.5H19.5C20.0523 6.5 20.5 6.94772 20.5 7.5V17.5C20.5 18.0523 20.0523 18.5 19.5 18.5H5.5C4.94772 18.5 4.5 18.0523 4.5 17.5V7.5Z"
					fill="black"
				/>
			</svg>
		),
	},
	{
		label: translate( 'Net Sales' ),
		attr: 'net_sales',
		isHidden: false,
		availableCharts: [],
		type: 'currency',
		icon: <Icon className="gridicon" icon={ currencyDollar } />,
	},
	{
		label: translate( 'Orders' ),
		attr: 'orders',
		type: 'number',
		availableCharts: [],
		icon: <Icon className="gridicon" icon={ shipping } />,
	},
	{
		label: translate( 'Avg. Order Value' ),
		attr: 'avg_order_value',
		type: 'currency',
		availableCharts: [],
		icon: <Icon className="gridicon" icon={ percent } />,
	},
];

export const noDataMsg = translate( 'No data found' );
