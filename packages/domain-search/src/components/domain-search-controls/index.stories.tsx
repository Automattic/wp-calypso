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

export const Default: Story = {
	args: {},
};

export const Input: Story = {
	render: () => <DomainSearchControls.Input />,
};

export const Filters: FiltersStory = {
	args: {
		count: 2,
	},
	render: ( args: { count?: number } ) => <DomainSearchControls.Filters count={ args.count } />,
};

export const FiltersList: Story = {
	render: () => <DomainSearchControls.FiltersList />,
};

export const Submit: Story = {
	render: () => <DomainSearchControls.Submit />,
};
