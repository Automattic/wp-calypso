import type { ShelfLayout } from './types';

/**
 * Maximum allowed length for a shelf name, enforced client-side for inline
 * validation. Must stay in sync with the backend limit defined in RSM-4139.
 */
export const MAX_SHELF_NAME_LENGTH = 50;

/** Presentation defaults applied to a freshly-created shelf. */
export const DEFAULT_SHELF_LAYOUT: ShelfLayout = {
	// Neutral post text by default (see `ShelfTextColor`); the icon still carries
	// a color so the shelf keeps a visible identity.
	color: 'none',
	iconColor: 'blue',
	icon: 'category',
};
