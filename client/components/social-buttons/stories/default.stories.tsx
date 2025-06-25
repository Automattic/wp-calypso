import {
	AuthFormSocial,
	appleStory,
	gitHubStory,
	googleStory,
	magicLoginStory,
	qrCodeStory,
	usernameOrEmailStory,
} from './shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/components/Social Button/Default',
	decorators: [ AuthFormSocial ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };

export const MagicLogin = { ...magicLoginStory };

export const QRCode = { ...qrCodeStory };

export const UsernameOrEmail = { ...usernameOrEmailStory };
