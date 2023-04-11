import { TYPE_WEBSITE, TYPE_ARTICLE } from '../constants';
import type { PreviewProps } from '../types';

export type FacebookUser = {
	displayName: string;
	avatarUrl?: string;
};

export type FacebookPreviewProps = PreviewProps & {
	user?: FacebookUser;
	type?: typeof TYPE_WEBSITE | typeof TYPE_ARTICLE;
};
