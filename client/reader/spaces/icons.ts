import { box, cart, category, comment, inbox, pages, starFilled, video } from '@wordpress/icons';
import type { SpaceIcon } from '@automattic/api-core';

/**
 * Maps a space's serializable `icon` key (from `@automattic/api-core`) to the
 * `@wordpress/icons` glyph the UI renders.
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
};
