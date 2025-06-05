import { A4AWrapper, appleStory, AuthFormSocial, gitHubStory, googleStory } from './shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/components/Social Button/A4A',
	decorators: [ AuthFormSocial, A4AWrapper ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };
