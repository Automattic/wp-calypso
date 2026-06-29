import {
	box,
	cart,
	category,
	chartBar,
	color,
	comment,
	gallery,
	globe,
	home,
	inbox,
	pages,
	people,
	rss,
	starFilled,
	tag,
	video,
} from '@wordpress/icons';
import type { SpaceIcon } from '@automattic/api-core';

/**
 * Maps a space's serializable `icon` key (from `@automattic/api-core`) to the
 * `@wordpress/icons` glyph the UI renders. The key is the stable identifier
 * stored server-side; the glyph is purely presentational, so swapping a glyph
 * never changes stored data.
 */
export const SPACE_ICONS: Record< SpaceIcon, JSX.Element > = {
	inbox,
	box,
	video,
	comment,
	cart,
	star: starFilled,
	pages,
	category,
	globe,
	tag,
	rss,
	people,
	home,
	gallery,
	chart: chartBar,
	palette: color,
};
