import {
	AuthFormSocial,
	WooWrapper,
	appleStory,
	gitHubStory,
	googleStory,
	magicLoginStory,
	qrCodeStory,
} from './shared';
import type { Meta } from '@storybook/react';
import '../../../layout/masterbar/woo.scss';

const meta: Meta = {
	title: 'client/components/Social Button/Woo',
	decorators: [ AuthFormSocial, WooWrapper ],
};

export default meta;

export const Apple = { ...appleStory };

export const GitHub = { ...gitHubStory };

export const Google = { ...googleStory };

export const MagicLogin = { ...magicLoginStory };

export const QRCode = { ...qrCodeStory };
