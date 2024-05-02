import {
	getFeaturesList,
	getPlanFeaturesGrouped,
	setTrailMapExperiment,
} from '@automattic/calypso-products';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { FeaturesGrid, FeaturesGridExternalProps, useGridPlansForFeaturesGrid } from '../..';
import { defaultArgs } from '../../storybook-mocks';
import * as mockGridPlans from '../../storybook-mocks/grid-plans';

const queryClient = new QueryClient();

const RenderFeaturesGrid = (
	props: FeaturesGridExternalProps & { includePreviousPlanFeatures: boolean }
) => {
	const useGridPlans = () => props.gridPlans;

	const gridPlans = useGridPlansForFeaturesGrid(
		{
			allFeaturesList: getFeaturesList(),
			useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
			storageAddOns: [],
			includePreviousPlanFeatures: props.includePreviousPlanFeatures,
			intent: props.intent,
		},
		useGridPlans
	);

	return (
		<FeaturesGrid
			{ ...props }
			gridPlans={ gridPlans || [] }
			featureGroupMap={ props.enableCategorisedFeatures ? getPlanFeaturesGrouped() : undefined }
		/>
	);
};

const meta: Meta<
	FeaturesGridExternalProps & {
		includePreviousPlanFeatures: boolean;
		trailMapVariant:
			| 'control'
			| 'treatment-copy'
			| 'treatment-structure'
			| 'treatment-copy-and-structure';
	}
> = {
	title: 'FeaturesGrid',
	component: RenderFeaturesGrid,
	decorators: [
		( Story, storyContext ) => {
			setTrailMapExperiment( storyContext.args.trailMapVariant );
			return (
				<QueryClientProvider client={ queryClient }>
					<Story />
				</QueryClientProvider>
			);
		},
	],
	parameters: {
		viewport: {
			defaultViewport: 'LARGE',
		},
	},
};

export default meta;

type Story = StoryObj<
	FeaturesGridExternalProps & {
		includePreviousPlanFeatures: boolean;
		trailMapVariant:
			| 'control'
			| 'treatment-copy'
			| 'treatment-structure'
			| 'treatment-copy-and-structure';
	}
>;

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

export const TrailMapControl: Story = {
	args: {
		...PlansFlow.args,
		trailMapVariant: 'control',
		gridPlanForSpotlight: undefined,
	},
};

export const TrailMapStructure: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment-structure',
		enableCategorisedFeatures: true,
		includePreviousPlanFeatures: true,
	},
};

export const TrailMapCopy: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment-copy',
	},
};
export const TrailMapCopyAndStructure: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment-copy-and-structure',
		enableCategorisedFeatures: true,
	},
};
