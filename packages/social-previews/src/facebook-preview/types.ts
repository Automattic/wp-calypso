import { TYPE_WEBSITE, TYPE_ARTICLE, LANDSCAPE_MODE, PORTRAIT_MODE } from '../constants';
import type { SocialPreviewBaseProps } from '../types';

export type ImageMode = typeof LANDSCAPE_MODE | typeof PORTRAIT_MODE;

export type FacebookUser = {
	displayName: string;
	avatarUrl?: string;
};

export type FacebookPreviewProps = SocialPreviewBaseProps & {
	user?: FacebookUser;
	type?: typeof TYPE_WEBSITE | typeof TYPE_ARTICLE;
	customText?: string;
	customImage?: string;
	imageMode?: ImageMode;
};
