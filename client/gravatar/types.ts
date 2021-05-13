/**
 * Internal Dependencies
 */
import type { URL } from '../types';

export type GravatarOptions = Partial< {
	s: number;
	d: DefaultImage;
	f?: 'y';
	forceDefault?: 'y';
	r?: Rating;
	rating?: Rating;
} >;

type DefaultImage =
	| '404'
	| 'mp'
	| 'identicon'
	| 'monsterid'
	| 'wavatar'
	| 'retro'
	| 'robohash'
	| 'blank'
	| URL;

type Rating = 'g' | 'pg' | 'r' | 'x';
