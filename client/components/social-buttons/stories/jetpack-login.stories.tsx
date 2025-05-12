import '../../../layout/masterbar/oauth-client.scss';
import '../../../jetpack-connect/colors.scss';
import '../../../login/wp-login/style.scss';

import {
	appleStory,
	AuthFormSocial,
	gitHubStory,
	googleStory,
	qrCodeStory,
	JetpackLoginWrapper,
} from './shared';
import type { Meta } from '@storybook/react';

const meta: Meta = {
	title: 'client/components/Social Button/Jetpack Login',
	decorators: [ AuthFormSocial, JetpackLoginWrapper ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };

export const QRCode = { ...qrCodeStory };
