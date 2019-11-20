enum ActionType {
	RECEIVE_VERTICALS = 'RECEIVE_VERTICALS',
	RESET_SITE_TYPE = 'RESET_SITE_TYPE',
	SET_DOMAIN = 'SET_DOMAIN',
	SET_SITE_TITLE = 'SET_SITE_TITLE',
	SET_SITE_TYPE = 'SET_SITE_TYPE',
	SET_SITE_VERTICAL = 'SET_SITE_VERTICAL',
}
export { ActionType };

export enum SiteType {
	BLOG = 'blog',
	BUSINESS = 'business',
	PORTFOLIO = 'portfolio',
	STORE = 'store',
}

export interface SiteVertical {
	label: string;
	id: string;
}

export const EMPTY_FORM_VALUE = Object.freeze( {} );
export type FormValue< T > = T | typeof EMPTY_FORM_VALUE;
export function isFilledFormValue< T >( value: FormValue< T > ): value is T {
	return value !== EMPTY_FORM_VALUE;
}

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
