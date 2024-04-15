import { getFeaturesList } from '@automattic/calypso-products';
import { Meta } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ComparisonGrid, useGridPlansForComparisonGrid } from '../..';
import { defaultArgs } from '../../storybook-mocks';

const queryClient = new QueryClient();

const RenderComparisonGrid = ( props: any ) => {
	const useGridPlans = () => defaultArgs.gridPlans;

	const gridPlansForComparisonGrid = useGridPlansForComparisonGrid(
		{
			allFeaturesList: getFeaturesList(),
			selectedFeature: props.selectedFeature,
			showLegacyStorageFeature: props.showLegacyStorageFeature,
			useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
			storageAddOns: [],
		},
		useGridPlans
	);

	return <ComparisonGrid { ...props } gridPlans={ gridPlansForComparisonGrid } />;
};

export default {
	title: 'plans-grid-next',
	component: RenderComparisonGrid,
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
