import {
	WPJobManagerWrapper,
	appleStory,
	AuthFormSocial,
	gitHubStory,
	googleStory,
} from './shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/components/Social Button/WP Job Manager',
	decorators: [ AuthFormSocial, WPJobManagerWrapper ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };
