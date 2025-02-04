import { StyleVariation } from '@automattic/design-picker';
import type { NonUndefined } from 'utility-types';

// Web stuff
export type URL = string;
export type Scheme = 'http' | 'https';

// User stuff

// Site stuff
export type SiteId = number;
export type SiteSlug = string;

// Plan stuff
export type PlanSlug = string;

// Plugin stuff

// Post stuff
export type PostId = number;
export type PostType = 'page' | 'post' | string;

export interface Theme {
	author: string;
	author_uri: string;
	cost: ThemeCost;
	block_theme?: boolean;
	date_launched: string;
	date_updated: string;
	demo_uri?: string;
	description: string;
	descriptionLong: string;
	download: string;
	download_url: string;
	id: string;
	launch_date: string;
	license: string;
	license_uri: string;
	name: string;
	next: string;
	popularity_rank: string;
	product_details?: MarketplaceThemeProductDetails[];
	preview_url: string;
	screenshot: string;
	screenshots: string[];
	style_variations: StyleVariation[];
	stylesheet: string;
	supportDocumentation: string;
	tags: string[];
	taxonomies?: {
		theme_feature?: ThemeFeature[];
		theme_software_set?: ThemeSoftwareSet[];
		theme_subject?: ThemeSubject[];
	};
	template: string;
	theme_uri: string;
	theme_tier: {
		slug: string;
		feature?: string;
		featureList?: string[];
		platform: string;
	};
	trending_rank: number;
	version: string;
}

interface MarketplaceThemeProductDetails {
	product_id: number;
	product_slug: string;
	billing_product_slug: string;
}

interface ThemeCost {
	currency: string;
	number: number;
	display: string;
}

interface ThemeFeature {
	name: string;
	slug: string;
	term_id: string;
}

export interface ThemeSoftwareSet {
	name: string;
	slug: string;
	term_id: string;
}

interface ThemeSubject {
	name: string;
	slug: string;
	term_id: string;
}

// Comment stuff
export type CommentId = number;

// Language stuff
export type Lazy< T > = () => T;
export type TimeoutMS = NonUndefined< Parameters< typeof setTimeout >[ 1 ] >;
export type TimestampMS = ReturnType< typeof Date.now >;
export type TimerHandle = ReturnType< typeof setTimeout >;
export type IntervalHandle = ReturnType< typeof setInterval >;
export type JSONSerializable =
	| null
	| boolean
	| number
	| string
	| JSONSerializable[]
	| { [ prop: string ]: JSONSerializable };

/**
 * Calypso application state
 *
 * Calypso application state is not yet well typed.
 */
export type AppState = __TodoAny__;

/**
 * This is an `any` type alias.
 * It is intended to signify an `any` type that is impossible or impractical to type more strictly.
 * It should be accompanied by a comment describing the conditions for its use and when it can be replaced.
 *
 * **Please, use sparingly!**
 */
export type __TodoAny__ = any; /* eslint-disable-line @typescript-eslint/no-explicit-any */

// Properties added to the `window` object:
declare global {
	interface Window {
		COMMIT_SHA: string; // Added by an inline script in <head> via SSR context + webpack.
		app?: {
			isDebug?: boolean;
		};
		__REDUX_DEVTOOLS_EXTENSION__?: () => void;
	}
}
