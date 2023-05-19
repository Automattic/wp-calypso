import type { SectionHeadingProps } from './shared/section-heading';

export interface SocialPreviewBaseProps {
	/**
	 * The URL of the post/page to preview.
	 */
	url: string;

	/**
	 * The title of the post/page to preview.
	 */
	title: string;

	/**
	 * The description of the post/page to preview.
	 */
	description: string;

	/**
	 * The URL of the image to use in the post/page preview.
	 */
	image?: string;
}

export interface SocialPreviewsBaseProps {
	headingLevel?: SectionHeadingProps[ 'level' ];
}

export type MediaItem = {
	/**
	 * The alt text for the image.
	 */
	alt?: string;

	/**
	 * The mime type of the media
	 */
	type: string;

	/**
	 * The URL of the media.
	 */
	url: string;
};
