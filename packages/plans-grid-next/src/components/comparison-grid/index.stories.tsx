import {
	getFeaturesList,
	getPlanFeaturesGrouped,
	setTrailMapExperiment,
} from '@automattic/calypso-products';
import { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ComparisonGrid, ComparisonGridExternalProps, useGridPlansForComparisonGrid } from '../..';
import { defaultArgs } from '../../storybook-mocks';
import * as mockGridPlans from '../../storybook-mocks/grid-plans';

const queryClient = new QueryClient();

const RenderComparisonGrid = ( props: ComparisonGridExternalProps ) => {
	const useGridPlans = () => props.gridPlans;

	const gridPlans = useGridPlansForComparisonGrid(
		{
			allFeaturesList: getFeaturesList(),
			useCheckPlanAvailabilityForPurchase: () => ( { value_bundle: true } ),
			storageAddOns: [],
		},
		useGridPlans
	);

	return (
		<ComparisonGrid
			{ ...props }
			gridPlans={ gridPlans || [] }
			featureGroupMap={ getPlanFeaturesGrouped() }
		/>
	);
};

const meta: Meta<
	ComparisonGridExternalProps & {
		trailMapVariant:
			| 'control'
			| 'treatment-copy'
			| 'treatment-structure'
			| 'treatment-copy-and-structure';
	}
> = {
	title: 'ComparisonGrid',
	component: RenderComparisonGrid,
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
	ComparisonGridExternalProps & {
		trailMapVariant:
			| 'control'
			| 'treatment-copy'
			| 'treatment-structure'
			| 'treatment-copy-and-structure';
	}
>;

export const StartFlow: Story = {
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
	},
};

StartFlow.storyName = '/start';

export const HideUnsupportedFeaturesOnMobile: Story = {
	args: {
		...StartFlow.args,
		hideUnsupportedFeatures: true,
	},
};

export const TrailMapControl: Story = {
	args: {
		...StartFlow.args,
		trailMapVariant: 'control',
	},
};

export const TrailMapStructure: Story = {
	args: {
		...TrailMapControl.args,
		trailMapVariant: 'treatment-structure',
		hideUnsupportedFeatures: true,
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
		hideUnsupportedFeatures: true,
	},
};
