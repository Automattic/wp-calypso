import { SiteIcon } from '../';
import type { Meta, StoryObj } from '@storybook/react';
import './style.stories.scss';

const meta: Meta< typeof SiteIcon > = {
	title: 'Components/SiteIcon',
	component: SiteIcon,
};

export default meta;

type Story = StoryObj< typeof SiteIcon >;

export const Default: Story = {
	args: {
		className: 'custom-icon-styles',
	},
};
