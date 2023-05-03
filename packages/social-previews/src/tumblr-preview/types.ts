import type { PreviewProps } from '../types';

export type TumblrUser = {
	displayName: string;
	avatarUrl?: string;
};

export type TumblrPreviewProps = PreviewProps & {
	user?: TumblrUser;
};
