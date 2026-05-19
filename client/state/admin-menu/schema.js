/**
 * Schema for the cached `/wpcom/v2/admin-menu` response.
 *
 * The redesign (DES-575 / `WordPress/wp-admin-sidebar` v0.1.4) adds optional
 * classifier fields (`itemId`, `source`, `default_weight`, `reassignable`,
 * `group_id`, `signal`) and a top-level `groups[]` array. The new per-item
 * fields are accepted here in lock-step with the Jetpack endpoint PR (Phase 1
 * task 1.1) so that `withSchemaValidation` in `reducer.js` does not silently
 * drop a payload that carries them. Existing consumers that ignore these
 * fields see no change in behaviour.
 *
 * The top-level `groups[]` array travels through the data layer as a sibling
 * to `menu[]` and is normalised on the way into the reducer (see
 * `state/data-layer/wpcom/sites/admin-menu`). The cache here keeps only the
 * flat `menu[]` array per the existing contract; `groups[]` is folded into
 * each item via the redesigned selector pipeline.
 *
 * See `client/state/admin-menu/types.ts` for the typed shape.
 */

const signalPropsSchema = {
	type: 'object',
	properties: {
		count: { type: [ 'integer', 'null' ] },
		numeric_badge: { type: [ 'integer', 'null' ] },
		badge: { type: [ 'string', 'null' ] },
		inline_text: { type: [ 'string', 'null' ] },
		inline_icon: { type: [ 'string', 'null' ] },
		attention: { type: 'boolean' },
	},
};

const commonItemPropsSchema = {
	slug: { type: 'string' },
	title: { type: 'string' },
	type: { type: 'string' },
	url: { type: 'string' },
	badge: { type: 'string' },
	// Optional: compound item identifier used by customize-mode layout deltas.
	itemId: { type: 'string' },
	// Optional: classifier source, e.g. `core`, `plugin`, or `wpcom`.
	source: { type: 'string' },
	// Optional: classifier ordering hint. Server-side order is already applied.
	default_weight: { type: 'integer' },
	// Optional: whether customize mode may move this item.
	reassignable: { type: 'boolean' },
	// Optional: the group this item belongs to. `null` / missing = top-level.
	group_id: { type: [ 'string', 'null' ] },
	// Optional: attention / count / badge data. `null` = item produced no signal.
	signal: {
		oneOf: [ signalPropsSchema, { type: 'null' } ],
	},
};

const menuItemsSite = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'type' ],
		properties: {
			...commonItemPropsSchema,
			icon: { type: 'string' },
			children: {
				type: 'array',
				items: {
					type: 'object',
					required: [ 'type', 'parent' ],
					properties: {
						...commonItemPropsSchema,
						parent: { type: 'string' },
					},
				},
			},
		},
	},
	additionalProperties: false,
};

const groupsSite = {
	type: 'array',
	items: {
		type: 'object',
		required: [ 'id', 'label' ],
		properties: {
			id: { type: 'string' },
			label: { type: 'string' },
			default_expanded: { type: 'boolean' },
			signal: {
				type: 'object',
				properties: {
					attention: { type: 'boolean' },
					count: { type: 'integer' },
				},
			},
		},
		additionalProperties: false,
	},
};

export const menusSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': menuItemsSite,
	},
};

export const groupsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': groupsSite,
	},
};
