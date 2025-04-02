import { StoryObj, Meta } from '@storybook/react';
import AutomatticLogo from './index';

const meta: Meta< typeof AutomatticLogo > = {
	title: 'client/components/AutomatticLogo',
	component: AutomatticLogo,
};
export default meta;

type Story = StoryObj< typeof AutomatticLogo >;

export const Default: Story = {};
