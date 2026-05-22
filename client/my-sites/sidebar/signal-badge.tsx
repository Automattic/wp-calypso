/**
 * `<SignalBadge>` — item-level signal renderer.
 *
 * React translation of the public plugin's `renderItemSignal`
 * (`WordPress/wp-admin-sidebar` v0.1.4 `src/browse-rail/signal.js:108-156`).
 * The plugin appends the badge / inline-text / inline-icon spans inside the
 * item's `.wp-menu-name` so they sit on the same line as the title; this
 * React component is rendered by the item-level renderer at the same
 * insertion point (next to the title) so the rendered DOM is structurally
 * equivalent.
 *
 * Visual contract — locked from `WordPress/wp-admin-sidebar` v0.1.4
 * `src/browse-rail/styles.css`:
 *
 *   .wp-admin-sidebar-item__badge {
 *     display: inline-block;
 *     box-sizing: border-box;
 *     margin-left: 6px;
 *     padding: 0 6px;
 *     min-width: 18px;
 *     height: 18px;
 *     border-radius: 9px;
 *     background: #d63638;
 *     color: #fff;
 *     font: 600 11px/18px ...;
 *     text-align: center;
 *     vertical-align: middle;
 *   }
 *
 * Single-digit values render as 18×18 circles (min-width: 18px + 9px radius);
 * multi-digit values stretch into pills (the radius keeps the rounded ends).
 *
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/signal.js
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/styles.css
 */

import { translate } from 'i18n-calypso';
import resolveItemSignal, { type ResolvedItemSignal } from './utils/resolve-item-signal';
import type { AdminMenuSignal } from 'calypso/state/admin-menu/types';

export interface SignalBadgeProps {
	/**
	 * The raw `signal` subobject from the admin-menu response. Pass
	 * `item.signal` directly. `null` / `undefined` is valid — the component
	 * renders nothing.
	 */
	signal?: AdminMenuSignal | null;
	/**
	 * Pre-resolved signal — overrides `signal` when supplied. Useful for
	 * Storybook stories and tests so the priority chain is exercised once
	 * upstream and the component renders deterministic output.
	 */
	resolved?: ResolvedItemSignal | null;
	/**
	 * Optional accessible label override for the badge. By default the
	 * component derives a label from the badge text (numeric or string).
	 * Callers can override when the surrounding context already announces
	 * the count.
	 */
	badgeLabel?: string;
}

export const SignalBadge = ( { signal, resolved: resolvedProp, badgeLabel }: SignalBadgeProps ) => {
	const resolved = resolvedProp !== undefined ? resolvedProp : resolveItemSignal( signal );
	if ( ! resolved ) {
		return null;
	}

	return (
		<>
			{ resolved.badgeText !== null && (
				<span
					className="wp-admin-sidebar-item__badge"
					// SR-only label so the screen reader announces the badge as
					// "3 items" rather than as a bare digit. The visible text is
					// already the badge text, so this is the only announcement the
					// row needs.
					aria-label={ badgeLabel ?? resolveBadgeLabel( resolved.badgeText ) }
				>
					{ resolved.badgeText }
				</span>
			) }
			{ resolved.inlineText !== null && (
				<span className="wp-admin-sidebar-item__inline-text">{ resolved.inlineText }</span>
			) }
			{ resolved.inlineIcon !== null && (
				<span
					className={ `wp-admin-sidebar-item__inline-icon dashicons ${ resolved.inlineIcon }` }
					aria-hidden="true"
				/>
			) }
		</>
	);
};

/**
 * Build the SR-only label for a badge value. Numeric strings get
 * pluralised; arbitrary strings ("3", "!", "BETA") are passed through.
 *
 * Translators: When the badge text is purely numeric, this announces "<count>
 * items need attention" so the digit isn't read as a bare number out of
 * context. When the badge is non-numeric (rare — string fallback path), the
 * announcement falls back to the string itself.
 *
 * @param badgeText The visible text rendered inside the badge span.
 * @returns The SR-only label.
 */
function resolveBadgeLabel( badgeText: string ): string {
	const asNumber = Number.parseInt( badgeText, 10 );
	if ( Number.isFinite( asNumber ) && String( asNumber ) === badgeText ) {
		return translate( '%(count)d item needs attention', '%(count)d items need attention', {
			count: asNumber,
			args: { count: asNumber },
		} ) as string;
	}
	return badgeText;
}

export default SignalBadge;
