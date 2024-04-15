import { getFeaturesList } from '@automattic/calypso-products';
import { Meta } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { FeaturesGrid, useGridPlansForFeaturesGrid } from '../..';
import { defaultArgs } from '../../storybook-mocks';

const queryClient = new QueryClient();

const RenderFeaturesGrid = ( props: any ) => {
	const useGridPlans = () => defaultArgs.gridPlans;

	const gridPlansForFeaturesGrid = useGridPlansForFeaturesGrid(
		{
			allFeaturesList: getFeaturesList(),
			selectedFeature: props.selectedFeature,
			showLegacyStorageFeature: props.showLegacyStorageFeature,
			useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
			storageAddOns: [],
		},
		useGridPlans
	);

	return <FeaturesGrid { ...props } gridPlans={ gridPlansForFeaturesGrid } />;
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
	args: defaultArgs,
};

export const FeaturesGridTest = {
	...storyDefaults,
};
