import type { SocialPreviewBaseProps } from '../types';

export type MastodonUser = {
	displayName: string;
	avatarUrl: string;
	address: string;
};

export type MastodonAddressDetails = {
	username: string;
	instance: string;
};

export type MastodonPreviewProps = SocialPreviewBaseProps & {
	user?: MastodonUser;
	customText?: string;
	customImage?: string;
	siteName?: string;
};
