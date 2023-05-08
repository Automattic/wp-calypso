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
