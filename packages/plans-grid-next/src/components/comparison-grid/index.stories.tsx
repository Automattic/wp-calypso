import { getFeaturesList } from '@automattic/calypso-products';
import { Meta } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ComparisonGrid, useGridPlansForComparisonGrid } from '../..';
import { defaultArgs } from '../../storybook-mocks';
const queryClient = new QueryClient();
const RenderFeaturesGrid = ( props: any ) => {
	const filteredPlansForPlanFeatures = defaultArgs.gridPlans;

	const gridPlansForComparisonGrid = useGridPlansForComparisonGrid( {
		allFeaturesList: getFeaturesList(),
		gridPlans: filteredPlansForPlanFeatures,
		selectedFeature: props.selectedFeature,
		showLegacyStorageFeature: props.showLegacyStorageFeature,
	} );
	return <ComparisonGrid { ...props } gridPlans={ gridPlansForComparisonGrid } />;
};
export default {
	title: 'plans-grid-next',
	component: RenderFeaturesGrid,
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
	args: { ...defaultArgs, showLegacyStorageFeature: true, selectedFeature: 'storage' },
};

export const ComparisonGridTest = {
	...storyDefaults,
};
