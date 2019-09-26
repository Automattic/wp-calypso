/**
 * External dependencies
 */
import { NonUndefined } from 'utility-types';

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
