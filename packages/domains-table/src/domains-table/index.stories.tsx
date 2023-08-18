import { Meta } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';
import { DomainsTable } from './index';

const queryClient = new QueryClient();

export default {
	title: 'packages/domains-table/DomainsTable',
	component: DomainsTable,
	decorators: [
		( Story ) => (
			<QueryClientProvider client={ queryClient }>
				<Story />
			</QueryClientProvider>
		),
	],
	parameters: {
		viewport: {
			defaultViewport: 'LARGE',
		},
	},
} as Meta;

const defaultDomains = [
	{ domain: 'example1.com', blog_id: 1, primary_domain: true },
	{ domain: 'example2.com', blog_id: 1, primary_domain: false },
	{ domain: 'example3.com', blog_id: 2, primary_domain: true },
];

const defaultArgs = {
	domains: defaultDomains,
	fetchSiteDomains: ( siteId ) =>
		Promise.resolve( { domains: defaultDomains.filter( ( d ) => d.blog_id === siteId ) } ),
};

const storyDefaults = {
	args: defaultArgs,
};

export const TableWithRows = { ...storyDefaults };
