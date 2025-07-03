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

export const Default: Story = {
	args: {},
};

export const InputOnly: Story = {
	render: () => <DomainSearchControls.Input />,
};

export const FiltersOnly: Story = {
	render: () => <DomainSearchControls.Filters />,
};

export const SubmitOnly: Story = {
	render: () => <DomainSearchControls.Submit />,
};
