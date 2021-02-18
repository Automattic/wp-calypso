/**
 * Representation of well-known verticals
 */
export interface Vertical {
	is_user_input_vertical: false;
	vertical_id: string;
	vertical_slug: string;
	vertical_name: string;
	parent: string;
	preview: string;
	preview_styles_url: string;
	synonyms: string[];
}
