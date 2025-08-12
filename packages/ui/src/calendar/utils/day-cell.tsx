import { CalendarDay } from 'react-day-picker';
import type { Modifiers } from '../types';

/**
 * The dash array and offset are calculated by:
 * - measuring the path length (eg 92,28384)
 * - establishing how many segments should the path be split into (eg. 24)
 * - dividing the path length by the number of segments (eg. 92,28384 / 24 = 3,84516)
 * - playing with the dash offset to make sure the dashes look good on rounded corners
 */

/**
 * Dashed rectangle. The dash array and offset are chosen to make sure dashes
 * look good on rounded corners and have similar metrics to the other dash
 * preview shapes.
 */
const PreviewDashStartAndEnd = () => {
	return (
		<svg
			viewBox="0 0 32 32"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			stroke="currentColor"
			strokeDasharray="3.7677"
			strokeDashoffset="3.2"
			strokeWidth="1"
		>
			<path d="M29.5,0.5 h-27 a2,2 0 0 0 -2,2 v27 a2,2 0 0 0 2,2 h27 a2,2 0 0 0 2,-2 v-27 a2,2 0 0 0 -2,-2" />
		</svg>
	);
};

/**
 * Dashed top, left, and bottom sides, with rounded corners. The dash array and
 * offset are chosen to make sure that multiple days in a row show a seamless
 * dashed border, and the dashes look good on rounded corners.
 */
const PreviewDashStart = () => {
	return (
		<svg
			viewBox="0 0 32 32"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			stroke="currentColor"
			strokeDasharray="3.84516"
			strokeDashoffset="1.9226"
			strokeWidth="1"
		>
			<path d="M32,0.5 h-29.5 a2,2 0 0 0 -2,2 v27 a2,2 0 0 0 2,2 h30" />
		</svg>
	);
};
/**
 * Dashed top and bottom sides. The dash array and offset are chosen
 * to make sure that multiple days in a row show a seamless dashed border.
 */
const PreviewDashMiddle = () => {
	return (
		<svg
			viewBox="0 0 32 32"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			stroke="currentColor"
			strokeDasharray="3.9 4"
			strokeDashoffset="2"
			strokeWidth="1"
		>
			<line x1="0" y1="0.5" x2="100" y2="0.5" />
			<line x1="0" y1="31.5" x2="100" y2="31.5" />
		</svg>
	);
};
/**
 * Dashed top, right, and bottom sides, with rounded corners. The dash array and
 * offset are chosen to make sure that multiple days in a row show a seamless
 * dashed border, and the dashes look good on rounded corners.
 */
const PreviewDashEnd = () => {
	return (
		<svg
			viewBox="0 0 32 32"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			stroke="currentColor"
			strokeDasharray="3.84516"
			strokeDashoffset="1.9226"
			strokeWidth="1"
		>
			<path d="M0,0.5 h29.5 a2,2 0 0 1 2,2 v27 a2,2 0 0 1 -2,2 h-29.5" />
		</svg>
	);
};

/**
 * Render a grid cell for a specific day in the calendar.
 *
 * Handles interaction and focus for the day.
 * @see https://daypicker.dev/guides/custom-components
 */
export function Day(
	props: {
		/** The day to render. */
		day: CalendarDay;
		/** The modifiers to apply to the day. */
		modifiers: Modifiers;
	} & React.HTMLAttributes< HTMLDivElement >
) {
	const { day, modifiers, children, ...tdProps } = props;

	let PreviewDash;
	if ( modifiers.preview_start && modifiers.preview_end ) {
		PreviewDash = PreviewDashStartAndEnd;
	} else if ( modifiers.preview_start ) {
		PreviewDash = PreviewDashStart;
	} else if ( modifiers.preview_end ) {
		PreviewDash = PreviewDashEnd;
	} else if ( modifiers.preview ) {
		PreviewDash = PreviewDashMiddle;
	}

	return (
		<td { ...tdProps }>
			{ PreviewDash && <PreviewDash /> }
			{ children }
		</td>
	);
}
