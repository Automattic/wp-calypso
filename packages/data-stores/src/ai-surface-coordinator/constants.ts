// Visible height of Help Center's minimized bar, in px ($head-foot-height).
export const MINIMIZED_BAR_HEIGHT = 56;
// Visible height of Agents Manager's minimized "Ask AI" bar, in px. It is
// shorter than Help Center's bar (agenttic's MinimizedView), so offsets that
// stack against it use this value rather than MINIMIZED_BAR_HEIGHT.
export const AM_MINIMIZED_BAR_HEIGHT = 40;
// Vertical gap left between an open panel and the other surface's minimized bar.
export const STACK_GAP = 16;

// Persisted (localStorage) marker for boot tie-break. Not server-backed: it is
// a non-critical UI hint, so it avoids a backend allowed-key change.
export const LAST_EXPANDED_STORAGE_KEY = 'ai-surface-last-expanded';

// CSS custom properties written on :root and consumed by each surface's SCSS.
// Each defaults (when unset) to the surface's pre-coexistence value.
//
// Help Center yields to Agents Manager's persistent "Ask AI" launcher bar:
// when that bar occupies the bottom-right corner, Help Center (its open card
// and its minimized bar) shifts up by this offset to sit above it.
export const CSS_VAR_HC_BOTTOM_OFFSET = '--ai-surface-hc-bottom-offset';
// Bottom offset lifting the Agents Manager open panel above Help Center's
// minimized bar (the symmetric counterpart of the HC offset).
export const CSS_VAR_AM_BOTTOM_OFFSET = '--ai-surface-am-bottom-offset';
// Extra inline-end inset for Help Center to clear a docked Agents Manager rail.
export const CSS_VAR_RAIL_INSET = '--ai-surface-rail-inset';
