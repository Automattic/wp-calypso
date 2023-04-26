import { LANDSCAPE_MODE, PORTRAIT_MODE } from './constants';

export type ImageMode = typeof LANDSCAPE_MODE | typeof PORTRAIT_MODE;

export type PreviewProps = {
	url: string;
	title: string;
	description?: string;
	customText?: string;
	image?: string;
	customImage?: string;
	headingsLevel?: number;
	imageMode?: ImageMode;
};
