import {
	AUTO_SHARED_SOCIAL_POST_PREVIEW,
	AUTO_SHARED_LINK_PREVIEW,
	DEFAULT_LINK_PREVIEW,
} from './constants';

export type PreviewProps = {
	url: string;
	title: string;
	description?: string;
	customText?: string;
	image?: string;
	previewType:
		| typeof AUTO_SHARED_SOCIAL_POST_PREVIEW
		| typeof AUTO_SHARED_LINK_PREVIEW
		| typeof DEFAULT_LINK_PREVIEW;
};

export type TextFormatter = ( text: string ) => string;
