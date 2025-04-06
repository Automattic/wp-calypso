/**
 * Internal dependencies
 */
import { Home, Pages, Categories, Tags } from '../screens';
import { SidebarHome } from '../sidebar';

const routes = [
	{
		name: 'home',
		path: '/',
		areas: {
			sidebar: <SidebarHome />,
			content: <Home />,
		},

		widths: {},
	},
	{
		name: 'pages',
		path: '/pages',
		areas: {
			sidebar: <SidebarHome />,
			content: <Pages />,
		},

		widths: {},
	},
	{
		name: 'categories',
		path: '/categories',
		areas: {
			sidebar: <SidebarHome />,
			content: <Categories />,
		},
		widths: {},
	},
	{
		name: 'tags',
		path: '/tags',
		areas: {
			sidebar: <SidebarHome />,
			content: <Tags />,
		},
		widths: {},
	},
];

export const homeRoutes = routes;
