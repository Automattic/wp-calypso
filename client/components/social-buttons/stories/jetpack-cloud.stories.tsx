import {
	appleStory,
	AuthFormSocial,
	gitHubStory,
	googleStory,
	JetpackCloudWrapper,
} from './shared';
import type { Meta } from '@storybook/react';
import '../../../layout/masterbar/oauth-client.scss';

const meta: Meta = {
	title: 'client/components/Social Button/Jetpack Cloud',
	decorators: [ AuthFormSocial, JetpackCloudWrapper ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };
