/**
 * Schema for the per-site, per-group expand/collapse state.
 *
 * Shape: `{ [siteId]: { [groupId]: boolean } }`. Persistence is in scope as a
 * state-slice concern: the slice is registered with `withPersistence` so the
 * Redux storage layer round-trips it across reloads. Wiring the actual REST
 * POST flow (server-side persistence alongside the layout-delta endpoint) is
 * deferred to Phase 2 task 2.3 — see `a3-planning.md`.
 */

export const adminSidebarExpandStateSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			additionalProperties: { type: 'boolean' },
		},
	},
};
