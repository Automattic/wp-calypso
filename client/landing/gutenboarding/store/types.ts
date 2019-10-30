// With a _real_ TypeScript compiler, we could use const enums.
/* const */ enum ActionType {
	RECEIVE_VERTICAL = 'RECEIVE_VERTICAL',
	SET_SITE_TITLE = 'SET_SITE_TITLE',
	SET_SITE_TYPE = 'SET_SITE_TYPE',
}
export { ActionType };

export enum SiteType {
	BLOG = 'blog',
	STORE = 'store',
	STORY = 'story',
}

export type Vertical = ApiVertical | UserVertical;

export interface UserVertical {
	is_user_input_vertical: true;
	vertical_id: string;
	vertical_slug: string;
	vertical_name: string;
	parent: string;
	preview: string;
	preview_styles_url: string;
	synonyms: string[];
}

export interface ApiVertical {
	is_user_input_vertical: false;
	vertical_id: '';
	vertical_slug: string;
	vertical_name: string;
	parent: string;
	preview: '';
	preview_styles_url: string;
}

/**
 * Parameters type of a function, excluding the first parameter.
 *
 * This is useful for typing some @wordpres/data functions that make a leading
 * `state` argument implicit.
 */
export type TailParameters< F extends ( head: any, ...tail: any[] ) => any > = F extends (
	head: any,
	...tail: infer PS
) => any
	? PS
	: never;
