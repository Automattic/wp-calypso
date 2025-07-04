import { availableTlds } from './_mock';
import { DomainSearchControls } from '.';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof DomainSearchControls > = {
	title: 'DomainSearchControls',
	component: DomainSearchControls,
	tags: [ 'autodocs' ],
	parameters: {
		layout: 'centered',
	},
};

export default meta;
type Story = StoryObj< typeof DomainSearchControls >;
type FiltersStory = StoryObj< typeof DomainSearchControls.Filters >;
type FiltersListStory = StoryObj< typeof DomainSearchControls.FiltersList >;

export const Default: Story = {
	args: {},
};

export const Input: Story = {
	render: () => <DomainSearchControls.Input />,
};

export const Filters: FiltersStory = {
	args: {
		count: 2,
		availableTlds,
	},
	render: ( args: { availableTlds: string[] | undefined; count?: number } ) => (
		<DomainSearchControls.Filters count={ args.count } availableTlds={ args.availableTlds } />
	),
};

export const FiltersList: FiltersListStory = {
	args: {
		availableTlds,
	},
	render: ( args: { availableTlds?: string[] } ) => (
		<DomainSearchControls.FiltersList availableTlds={ args.availableTlds } />
	),
};

export const Submit: Story = {
	render: () => <DomainSearchControls.Submit />,
};
