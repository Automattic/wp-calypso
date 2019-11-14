// With a _real_ TypeScript compiler, we could use const enums.
/* const */ enum ActionType {
	RECEIVE_VERTICALS = 'RECEIVE_VERTICALS',
	RESET_SITE_TYPE = 'RESET_SITE_TYPE',
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

export type Vertical = ApiVertical | UserVertical;

/**
 * An ad-hoc vertical object based on user input
 *
 * A vertical like this is included with vertical suggestions if the query term does not match any known vertical.
 */
export interface UserVertical {
	is_user_input_vertical: true;

	vertical_id: '';
	vertical_slug: string;
	vertical_name: string;
	preview: string;
	preview_styles_url: string;
}

/**
 * Known vertical
 */
export interface ApiVertical {
	is_user_input_vertical: false;

	vertical_id: string;
	vertical_slug: string;
	vertical_name: string;
	parent: string;
	preview: string;
	preview_styles_url: string;
	synonyms: string[];
}
