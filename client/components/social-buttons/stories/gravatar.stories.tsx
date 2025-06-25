import { GravatarWrapper, appleStory, AuthFormSocial, gitHubStory, googleStory } from './shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/components/Social Button/Gravatar',
	decorators: [ AuthFormSocial, GravatarWrapper ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };
