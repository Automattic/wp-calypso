import { getFeaturesList, getPlanFeaturesGrouped } from '@automattic/calypso-products';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { FeaturesGrid, FeaturesGridExternalProps, useGridPlansForFeaturesGrid } from '../..';
import { defaultArgs } from '../../storybook-mocks';
import * as mockGridPlans from '../../storybook-mocks/grid-plans';

const queryClient = new QueryClient();

const RenderFeaturesGrid = ( props: FeaturesGridExternalProps ) => {
	const useGridPlans = () => props.gridPlans;

	const gridPlans = useGridPlansForFeaturesGrid(
		{
			allFeaturesList: getFeaturesList(),
			useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
			storageAddOns: [],
			includeAllFeatures: props.renderCategorisedFeatures,
		},
		useGridPlans
	);

	return (
		<FeaturesGrid
			{ ...props }
			gridPlans={ gridPlans || [] }
			featureGroupMap={ getPlanFeaturesGrouped() }
		/>
	);
};

const meta: Meta< typeof FeaturesGrid > = {
	title: 'FeaturesGrid',
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
};

export default meta;

type Story = StoryObj< typeof FeaturesGrid >;

export const PlansFlow: Story = {
	args: {
		...defaultArgs,
		intent: 'plans-default-wpcom',
		gridPlans: [
			mockGridPlans.free,
			mockGridPlans.personal,
			mockGridPlans.value,
			mockGridPlans.business,
			mockGridPlans.ecommerce,
			mockGridPlans.enterprise,
		],
		gridPlanForSpotlight: mockGridPlans.spotlight,
	},
};

PlansFlow.storyName = '/plans';

export const NewsletterFlow: Story = {
	args: {
		...defaultArgs,
		intent: 'plans-newsletter',
		gridPlans: [ mockGridPlans.free, mockGridPlans.personal, mockGridPlans.value ],
	},
};

NewsletterFlow.storyName = '/setup/newsletter';

export const CategorisedFeatures: Story = {
	args: {
		...PlansFlow.args,
		gridPlanForSpotlight: undefined,
		renderCategorisedFeatures: true,
	},
};
