import Nps from '.';
import type { Meta, StoryObj } from '@storybook/react';

type NpsStory = StoryObj< typeof Nps >;

const meta: Meta< typeof Nps > = {
	title: 'Nps v2',
	component: Nps,
};

export default meta;

export const Desktop: NpsStory = {
	args: {},
};

export const Mobile: NpsStory = {
	args: {},
	parameters: {
		viewport: { defaultViewport: 'mobile1' },
	},
};
