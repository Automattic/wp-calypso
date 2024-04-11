import { Meta } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { FeaturesGrid } from '../..';
import { defaultArgs } from '../../storybook-mocks';

const queryClient = new QueryClient();

export default {
	title: 'plans-grid-next',
	component: FeaturesGrid,
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

const storyDefaults = {
	args: defaultArgs,
};

export const FeaturesGridTest = {
	...storyDefaults,
};
