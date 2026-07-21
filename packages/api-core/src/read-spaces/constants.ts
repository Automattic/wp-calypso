import type { SpaceLayout } from './types';

/**
 * Maximum allowed length for a space name, enforced client-side for inline
 * validation. Must stay in sync with the backend limit defined in RSM-4139.
 */
export const MAX_SPACE_NAME_LENGTH = 50;

/** Presentation defaults applied to a freshly-created space. */
export const DEFAULT_SPACE_LAYOUT: SpaceLayout = {
	// Neutral post text by default (see `SpaceTextColor`); the icon still carries
	// a color so the space keeps a visible identity.
	color: 'none',
	iconColor: 'blue',
	icon: 'category',
};
