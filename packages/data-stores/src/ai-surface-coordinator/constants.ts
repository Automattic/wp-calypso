// Height of the Agents Manager "Ask AI" compact bar, in px. Matches Help
// Center's own minimized bar height ($head-foot-height, 56px).
export const MINIMIZED_BAR_HEIGHT = 56;
// Vertical gap left between Help Center and the Ask AI bar when stacked.
export const STACK_GAP = 8;

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
// Extra inline-end inset for Help Center to clear a docked Agents Manager rail.
export const CSS_VAR_RAIL_INSET = '--ai-surface-rail-inset';
