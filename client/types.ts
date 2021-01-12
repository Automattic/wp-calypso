/**
 * External dependencies
 */
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
		AppBoot: () => void;
		i18nLocaleStrings?: string;
	}
}
