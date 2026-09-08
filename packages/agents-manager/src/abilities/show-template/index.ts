import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { showTemplateCallback } from './callback';
import type { Ability } from '../types';

/**
 * The `show-template` ability definition.
 *
 * Turns on the editor's "Show template" mode, the same setting core's own
 * View menu toggles. In `post-only` the page's content is shown by itself and
 * the site header and footer are absent from the block tree, so the agent
 * cannot see them or edit them; this brings them in rather than describing a
 * route to them, which it cannot do reliably — it cannot see the user's screen.
 *
 * Named `big-sky/` like the other abilities in this category: the backend
 * route allowlists match on ability names, and this one is listed in
 * `wpcom-editor.php`.
 */
export const showTemplateAbility: Ability = {
	name: 'big-sky/show-template',
	label: __( 'Show the page template', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Turn on "Show template" in the editor, so the page renders inside its template and the site header and footer become part of the content you can read and edit. Use this when a header or footer change is asked for but `templateParts` reports no template part in view — call it, then read the page structure again before deciding you cannot make the change. Do NOT use it to recover a block edit that failed on a part already in view: that part is locked by the editing mode, not hidden, and this will not unlock it.',
		__i18n_text_domain__
	),
	input_schema: {
		type: 'object',
		properties: {},
		additionalProperties: false,
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the template is now showing.',
					},
					message: {
						type: 'string',
						description: 'Human-readable success or error message.',
					},
					error: {
						type: 'string',
						description: 'Error details when success is false.',
					},
					details: {
						type: 'object',
						description:
							'Whether the mode changed, whether a template part reached the editor, and the next step to take.',
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: {
				type: 'boolean',
			},
		},
		required: [ 'result', 'returnToAgent' ],
	},
	meta: {
		annotations: {
			clientRegistered: true,
			readonly: false,
			idempotent: true,
		},
	},
	callback: showTemplateCallback,
};
