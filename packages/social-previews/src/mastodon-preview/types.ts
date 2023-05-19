import type { SocialPreviewBaseProps } from '../types';

export type MastodonUser = {
	displayName: string;
	userName: string;
	avatarUrl: string;
};

export type MastodonPreviewProps = SocialPreviewBaseProps & {
	user?: MastodonUser;
	customText?: string;
};
