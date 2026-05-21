/**
 * Pure helper that turns an `AdminMenuSignal` into the rendered text + flag
 * shape the item-level signal renderer consumes.
 *
 * Mirrors the public plugin's `renderItemSignal` priority chain
 * (`WordPress/wp-admin-sidebar` v0.1.4 `src/browse-rail/signal.js:108-156`)
 * 1:1 — only the runtime differs:
 *
 * Badge text priority chain (first non-null wins):
 *   1. `numeric_badge` if numeric and `> 0`
 *      (primary indicator for plugin items — Sensei, WooCommerce pending
 *      counts, etc., carried via awaiting-mod with a digit text).
 *   2. `count` if numeric and `> 0`
 *      (wp-admin's count-N span pattern — update-plugins, menu-counter.
 *      Items can fire attention solely via this field — Payments, Yoast SEO,
 *      WooCommerce updates; without rendering it, the group's aggregate dot
 *      fires but no child shows where the attention is coming from. This is
 *      the bug fix the public plugin landed in PR #40 / issue #39).
 *   3. `badge` if string and non-empty
 *      (non-empty awaiting-mod text that didn't parse as a digit; rare in
 *      the wild but still triggers attention in PHP `Sidebar_Signals::map_to_nav`,
 *      so render it for parity).
 *
 * Decorative side-channels — independent of the badge chain and rendered
 * alongside the title:
 *   - `inline_text` (e.g. `"Premium"`, `"BETA"`). Does NOT contribute to
 *     attention; it's a plan-tier or status label only.
 *   - `inline_icon` (e.g. `"dashicons-warning"`). 14px glyph next to the
 *     title, aria-hidden because the badge / count usually carries the
 *     announcement.
 *
 * Returns `null` if the item produced no signal at all (no badge text and no
 * decorative side-channels) so callers can short-circuit the render.
 *
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/signal.js
 * @see ../../../state/admin-menu/types.ts
 */

import type { AdminMenuSignal } from 'calypso/state/admin-menu/types';

/**
 * The shape consumed by `<SignalBadge>` and the storybook stories. Every
 * field is optional: a renderer can ignore the inline channels without losing
 * the badge.
 */
export interface ResolvedItemSignal {
	/**
	 * The computed badge text (priority chain output). `null` when no badge
	 * field is populated — the badge span is omitted entirely so it doesn't
	 * paint a 0×0 box.
	 */
	badgeText: string | null;
	/**
	 * Decorative inline label (e.g. `"Premium"`). `null` if absent.
	 */
	inlineText: string | null;
	/**
	 * Decorative inline icon (dashicon slug). `null` if absent.
	 */
	inlineIcon: string | null;
	/**
	 * Convenience: `true` if any of the three render fields above is non-null.
	 * Lets callers short-circuit `<SignalBadge>` mounting on items with no
	 * signal whatsoever.
	 */
	hasAny: boolean;
}

/**
 * Resolve the rendered shape from a raw `AdminMenuSignal`.
 *
 * Pure / referentially transparent. Returns `null` when the signal is
 * itself `null` / `undefined` so callers can early-return without further
 * checks.
 * @param signal The item-level `signal` subobject from the admin-menu response.
 *   Pass `item.signal` directly. `null` / `undefined` is valid input.
 * @returns Rendered shape or `null` when there is nothing to render.
 */
export function resolveItemSignal(
	signal: AdminMenuSignal | null | undefined
): ResolvedItemSignal | null {
	if ( ! signal ) {
		return null;
	}

	const badgeText = pickBadgeText( signal );
	const inlineText = pickInlineText( signal );
	const inlineIcon = pickInlineIcon( signal );

	if ( badgeText === null && inlineText === null && inlineIcon === null ) {
		return null;
	}

	return {
		badgeText,
		inlineText,
		inlineIcon,
		hasAny: true,
	};
}

/**
 * Apply the priority chain (`numeric_badge → count → badge`) to choose the
 * badge text. Extracted so the chain is a single, testable function.
 *
 * Numeric values must be `> 0`; zero / negative is treated as no-attention
 * (matches the public plugin's check, which is what
 * `Sidebar_Signals::extract_count` produces in PHP). String badge must be
 * non-empty.
 * @param signal The item-level signal subobject.
 * @returns The badge text or `null` if no field qualifies.
 */
function pickBadgeText( signal: AdminMenuSignal ): string | null {
	if ( typeof signal.numeric_badge === 'number' && signal.numeric_badge > 0 ) {
		return String( signal.numeric_badge );
	}
	if ( typeof signal.count === 'number' && signal.count > 0 ) {
		return String( signal.count );
	}
	if ( typeof signal.badge === 'string' && signal.badge.length > 0 ) {
		return signal.badge;
	}
	return null;
}

function pickInlineText( signal: AdminMenuSignal ): string | null {
	return typeof signal.inline_text === 'string' && signal.inline_text.length > 0
		? signal.inline_text
		: null;
}

function pickInlineIcon( signal: AdminMenuSignal ): string | null {
	return typeof signal.inline_icon === 'string' && signal.inline_icon.length > 0
		? signal.inline_icon
		: null;
}

export default resolveItemSignal;
