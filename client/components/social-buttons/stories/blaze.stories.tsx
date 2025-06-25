import { appleStory, AuthFormSocial, BlazeWrapper, gitHubStory, googleStory } from './shared';
import type { Meta } from '@storybook/react';
import '../../../layout/masterbar/blaze-pro.scss';

const meta: Meta = {
	title: 'client/components/Social Button/Blaze Pro',
	decorators: [ AuthFormSocial, BlazeWrapper ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };
