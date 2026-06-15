import type { SpaceLayout } from './types';

/**
 * Maximum allowed length for a space name, enforced client-side for inline
 * validation. Must stay in sync with the backend limit defined in RSM-4139.
 */
export const MAX_SPACE_NAME_LENGTH = 50;

/** Presentation defaults applied to a freshly-created space. */
export const DEFAULT_SPACE_LAYOUT: SpaceLayout = {
	color: 'blue',
	icon: 'category',
};
