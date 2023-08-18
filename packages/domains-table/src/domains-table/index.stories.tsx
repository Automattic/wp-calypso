import { Meta } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React from 'react';
import { testDomain } from '../test-utils';
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

const testDomains = [
	testDomain( { domain: 'example1.com', blog_id: 1, primary_domain: true } ),
	testDomain( {
		domain: 'example1.wordpress.com',
		blog_id: 1,
		primary_domain: false,
		wpcom_domain: true,
	} ),
	testDomain( { domain: 'example3.com', blog_id: 2, primary_domain: true } ),
];

const defaultArgs = {
	domains: testDomains.map( ( [ partial ] ) => partial ),
	isAllSitesView: true,
	fetchSiteDomains: ( siteId ) =>
		Promise.resolve( {
			domains: testDomains.map( ( [ , full ] ) => full ).filter( ( d ) => d.blog_id === siteId ),
		} ),
};

const storyDefaults = {
	args: defaultArgs,
};

export const AllSitesTable = { ...storyDefaults };

export const SiteSpecificTable = {
	...storyDefaults,
	args: {
		...defaultArgs,
		domains: defaultArgs.domains.filter( ( d ) => d.blog_id === 1 ),
		isAllSitesView: false,
	},
};
