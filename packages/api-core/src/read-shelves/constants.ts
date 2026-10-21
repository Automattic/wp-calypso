import type { ShelfLayout } from './types';

/**
 * Maximum allowed length for a shelf name, enforced client-side for inline
 * validation. Must stay in sync with the backend limit defined in RSM-4139.
 */
export const MAX_SHELF_NAME_LENGTH = 50;

/** Maximum number of feeds/tags/languages a shelf can hold, enforced client-side. */
export const MAX_SHELF_FEEDS = 50;
export const MAX_SHELF_TAGS = 8;
export const MAX_SHELF_LANGUAGES = 5;

/** Presentation defaults applied to a freshly-created shelf. */
export const DEFAULT_SHELF_LAYOUT: ShelfLayout = {
	// Neutral post text by default (see `ShelfTextColor`); the icon still carries
	// a color so the shelf keeps a visible identity.
	color: 'none',
	iconColor: 'blue',
	icon: 'category',
};
