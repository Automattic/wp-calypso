// Height of each surface's minimized bar, in px. Help Center's bar is
// $head-foot-height (56px); Agents Manager's agenttic minimized bar matches.
export const MINIMIZED_BAR_HEIGHT = 56;
// Vertical gap between stacked minimized bars, in px.
export const STACK_GAP = 8;

// Persisted (localStorage) marker for boot tie-break. Not server-backed: it is
// a non-critical UI hint, so it avoids a backend allowed-key change.
export const LAST_EXPANDED_STORAGE_KEY = 'ai-surface-last-expanded';

// CSS custom properties written on :root and consumed by each surface's SCSS.
// Each defaults (when unset) to the surface's pre-coexistence value.
export const CSS_VAR_HC_STACK_BOTTOM = '--ai-surface-hc-stack-bottom';
export const CSS_VAR_AM_STACK_BOTTOM = '--ai-surface-am-stack-bottom';
export const CSS_VAR_RAIL_INSET = '--ai-surface-rail-inset';
