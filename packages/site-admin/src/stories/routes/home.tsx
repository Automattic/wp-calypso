/**
 * Internal dependencies
 */
import { DocsComponents, DocsRoutingSystem, Home } from '../screens';
import { SidebarComponents, SidebarHome } from '../sidebar';

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
		name: 'docs-components',
		path: '/components',
		areas: {
			sidebar: <SidebarComponents />,
			content: <DocsComponents />,
		},

		widths: {},
	},
	{
		name: 'docs-routing-system',
		path: '/routing-system',
		areas: {
			sidebar: <SidebarHome />,
			content: <DocsRoutingSystem />,
		},
		widths: {},
	},
];

export const homeRoutes = routes;
