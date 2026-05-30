/**
 * Schema for the per-user, per-site saved layout delta from the
 * `wpcom/v2/wp-admin-sidebar/layout` endpoint.
 *
 * Shape: `{ [siteId]: { version, updated_at, overrides: [{ itemId, position }] } }`.
 * The endpoint owns the canonical shape; this schema is the lock-step gate
 * keeping `withSchemaValidation` from silently dropping cached payloads.
 *
 * Mirrors `Sidebar_Rest::validate_delta()` and `cloneDelta()` in the public
 * plugin's `customizer/draft-state.js` v0.1.4.
 * @see WordPress/wp-admin-sidebar v0.1.4 src/class-sidebar-rest.php
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/draft-state.js
 */

const positionSchema = {
	type: 'object',
	required: [ 'kind', 'index' ],
	properties: {
		kind: { enum: [ 'top_level', 'in_group' ] },
		group_id: { type: 'string' },
		index: { type: 'integer', minimum: 0 },
	},
};

const overrideSchema = {
	type: 'object',
	required: [ 'itemId', 'position' ],
	properties: {
		itemId: { type: 'string' },
		position: positionSchema,
	},
};

const deltaSchema = {
	type: 'object',
	required: [ 'version', 'updated_at', 'overrides' ],
	properties: {
		version: { type: 'integer', minimum: 1 },
		updated_at: { type: 'integer', minimum: 0 },
		overrides: {
			type: 'array',
			items: overrideSchema,
		},
	},
};

export const adminSidebarLayoutSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': deltaSchema,
	},
};
