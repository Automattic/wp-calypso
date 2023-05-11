import type { SocialPreviewBaseProps } from '../types';

export type TumblrUser = {
	displayName: string;
	avatarUrl?: string;
};

export type TumblrPreviewProps = SocialPreviewBaseProps & {
	user?: TumblrUser;
	customText?: string;
};
