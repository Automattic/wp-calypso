import { themes as prismThemes } from 'prism-react-renderer';
import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'Automattic Design System',
	tagline: 'TODO: Do we have a tagline?',
	// TODO: Add a favicon
	favicon: 'img/favicon.ico',

	// TODO: Set the production url here
	url: 'https://your-docusaurus-site.example.com',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: [ 'en' ],
	},

	plugins: [ 'docusaurus-plugin-sass' ],

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts',
					// Remove this to remove the "edit this page" links.
					editUrl: 'https://github.com/Automattic/wp-calypso/tree/trunk/apps/design-system-docs',
					routeBasePath: '/',
				},
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		colorMode: {
			disableSwitch: true,
		},
		// TODO: Replace with your project's social card
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			title: 'A8C DS',
			logo: {
				alt: 'Automattic Design System',
				// TODO: Replace with the our logo
				src: 'img/logo.svg',
			},
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'foundationsSidebar',
					position: 'left',
					label: 'Foundations',
				},
				{
					type: 'docSidebar',
					sidebarId: 'patternsSidebar',
					position: 'left',
					label: 'Patterns',
				},
				{
					type: 'docSidebar',
					sidebarId: 'componentsSidebar',
					position: 'left',
					label: 'Components',
				},
				{
					href: 'https://github.com/Automattic/wp-calypso/tree/trunk/apps/design-system-docs',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		// TODO: Figure out what to put in the footer
		footer: {
			links: [
				{
					title: 'Docs',
					items: [
						{
							label: 'Foundations',
							to: '/foundations/',
						},
						{
							label: 'Patterns',
							to: '/patterns/',
						},
						{
							label: 'Components',
							to: '/components/ds/',
						},
					],
				},
				{
					title: 'Connect',
					items: [
						{
							label: 'A8C Slack',
							href: 'https://a8c.slack.com/archives/CNGQYA3B9',
						},
						{
							label: 'GitHub',
							href: 'https://github.com/Automattic/wp-calypso/tree/trunk/apps/design-system-docs',
						},
					],
				},
			],
			copyright: `Copyright © ${ new Date().getFullYear() } Automattic, Inc.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
