/** @ssr-ready **/

import { isEnabled } from 'config';

export const FIRST_VIEW_CONFIG = [
	{
		name: 'stats',
		paths: [
			'/stats',
		],
		enabled: true,
		startDate: '2016-07-26',
	},
	{
		name: 'pages-prototype',
		paths: [
			'/pages',
		],
		enabled: isEnabled( 'pages/first-view-prototype' ),
	}
];
