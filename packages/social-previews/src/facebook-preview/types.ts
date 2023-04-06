import type { PreviewProps } from '../types';

export type FacebookUser = {
	displayName: string;
	avatarUrl?: string;
};

export type FacebookPreviewProps = PreviewProps & {
	user?: FacebookUser;
};
