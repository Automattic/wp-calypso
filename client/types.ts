/**
 * Internal dependencies
 */
import reducer from 'state/reducer';
import { createReduxStore } from 'state';

// Web stuff
export type URL = string;

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
export type TimestampMS = ReturnType< typeof Date.now >;
export type TimerHandle = ReturnType< typeof setTimeout >;

// Application State
export type CalypsoState = ReturnType< typeof reducer >;
export type CalypsoStore = ReturnType< typeof createReduxStore >;

/**
 * This is an `any` type alias.
 * It is intended to signify an `any` type that is impossible or impractical to type more strictly.
 * It should be accompanied by a comment describing the conditions for its use and when it can be replaced.
 *
 * **Please, use sparingly!**
 */
export type __TodoAny__ = any;
