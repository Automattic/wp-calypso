import { Meta } from '@storybook/react';
import { DomainsTable } from './index';

export default {
	title: 'packages/domains-table/DomainsTable',
	component: DomainsTable,
	parameters: {
		viewport: {
			defaultViewport: 'LARGE',
		},
	},
} as Meta;

const defaultArgs = {
	domains: [
		{ domain: 'example1.com', blog_id: 1 },
		{ domain: 'example2.com', blog_id: 1 },
		{ domain: 'example3.com', blog_id: 2 },
	],
};

const storyDefaults = {
	args: defaultArgs,
};

export const TableWithRows = { ...storyDefaults };
