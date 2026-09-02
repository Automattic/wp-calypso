import {
	chartBar,
	caution,
	check,
	comment,
	info,
	lockOutline,
	plus,
	store,
	thumbsUp,
	update,
} from '@wordpress/icons';
import { SVG, G, Path } from '@wordpress/primitives';
import { getNoticonName } from './note-model';
import type { NoticonName } from './note-model';
import type { JSX } from 'react';

// Gridicons the wp icon set has no equivalent for (same shapes the legacy
// panel shows).
const trophy: JSX.Element = (
	<SVG version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 24 24">
		<G>
			<Path
				d="M18,5.062V3H6v2.062H2V8c0,2.525,1.889,4.598,4.324,4.932C7.024,14.99,8.809,16.542,11,16.91V18c0,1.105-0.895,2-2,2H8v2h1
		h2h2h2h1v-2h-1c-1.105,0-2-0.895-2-2v-1.09c2.191-0.368,3.976-1.92,4.676-3.978C20.111,12.598,22,10.525,22,8V5.062H18z M4,8V7.062
		h2v3.766C4.836,10.416,4,9.304,4,8z M20,8c0,1.304-0.836,2.416-2,2.829V7.062h2V8z"
			/>
		</G>
	</SVG>
);

const reply: JSX.Element = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M9 16h7.2l-2.6 2.6L15 20l5-5-5-5-1.4 1.4 2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6z" />
	</SVG>
);

// This shell's visuals for the shared semantic names — the reply arrow is
// deliberate (the panel redesign shows a comment icon instead).
const ICONS_BY_NAME: Record< NoticonName, JSX.Element > = {
	mention: comment,
	comment,
	add: plus,
	info,
	lock: lockOutline,
	stats: chartBar,
	reblog: update,
	star: thumbsUp,
	trophy,
	reply,
	warning: caution,
	checkmark: check,
	cart: store,
};

/** The note's context icon for its `noticon` glyph. */
export function getNoticonIcon( glyph: string ): JSX.Element {
	return ICONS_BY_NAME[ getNoticonName( glyph ) ];
}

export const replyIcon = reply;
