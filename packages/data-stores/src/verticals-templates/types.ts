export const enum ActionType {
	RECEIVE_TEMPLATES = 'RECEIVE_TEMPLATES',
}

export interface Template {
	/**
	 * Block-editor HTML (includes block style markup)
	 *
	 * @example
	 *
	 * <!-- wp:paragraph {"align":"left"} -->
	 * <p style="text-align:left;">Visitors will want to know who is on the other side of the page. Use this space to write about yourself, your site, your business, or anything you want. Use the testimonials below to quote others, talking about the same thing – in their own words.</p>
	 * <!-- /wp:paragraph -->
	 * …
	 */
	content: string;

	slug: string;

	title: string;

	category: null | string;

	/**
	 * Prose description of template.
	 */
	description: string;

	/**
	 * Preview image URL
	 */
	preview: string;
}
