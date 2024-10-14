import type { SocialPreviewBaseProps } from '../types';

export type BlueskyUser = {
	displayName: string;
	avatarUrl: string;
	address: string;
};

export type BlueskyPreviewProps = SocialPreviewBaseProps & {
	appendUrl?: boolean;
	user?: BlueskyUser;
	customText?: string;
	customImage?: string;
};
