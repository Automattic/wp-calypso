/**
 * Internal dependencies
 */
import { DocsComponents } from '../screens';
import { SidebarComponents } from '../sidebar';

const routes = [
	{
		name: 'components-sidebar',
		path: '/components/sidebar',
		areas: {
			sidebar: <SidebarComponents />,
			content: <DocsComponents />,
		},

		widths: {},
	},
	{
		name: 'components-sidebar-button',
		path: '/components/sidebar-button',
		areas: {
			sidebar: <SidebarComponents />,
			content: <DocsComponents />,
		},

		widths: {},
	},
	{
		name: 'components-sidebar-navigation-item',
		path: '/components/sidebar-navigation-item',
		areas: {
			sidebar: <SidebarComponents />,
			content: <DocsComponents />,
		},
		widths: {},
	},
	{
		name: 'components-sidebar-navigation-screen',
		path: '/components/sidebar-navigation-screen',
		areas: {
			sidebar: <SidebarComponents />,
			content: <DocsComponents />,
		},
		widths: {},
	},
	{
		name: 'components-site-icon',
		path: '/components/site-icon',
		areas: {
			sidebar: <SidebarComponents />,
			content: <DocsComponents />,
		},
		widths: {},
	},
	{
		name: 'components-site-hub',
		path: '/components/site-hub',
		areas: {
			sidebar: <SidebarComponents />,
			content: <DocsComponents />,
		},
		widths: {},
	},
];

export const componentsRoutes = routes;
