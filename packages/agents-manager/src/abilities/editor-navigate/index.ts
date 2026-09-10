import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { editorNavigateCallback } from './callback';
import type { Ability } from '../types';

/**
 * The `editor-navigate` ability definition.
 *
 * Saves pending edits, then moves the site editor to another page. The
 * callback reports success only once the editor has actually loaded that
 * page, so the agent never reads or edits the departed page's blocks.
 */
export const editorNavigateAbility: Ability = {
	name: 'big-sky/editor-navigate',
	label: __( 'Navigate', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Saves everything and navigates in the editor. Use "page/{id}" with the numeric id from <site_pages> to open one page, or "all-pages" to open the pages list. Full URLs, slugs and paths like "/visit" are invalid — if the user names a page, look up its numeric id first.',
		__i18n_text_domain__
	),
	input_schema: {
		type: 'object',
		properties: {
			path: {
				type: 'string',
				pattern: '^(/?page/[1-9][0-9]{0,14}/?|all-pages)$',
				description:
					'Where to navigate: a numeric page path like "page/123" (or "/page/123"), or "all-pages" for the pages list. Invalid: full URLs, slugs, "/visit", "/page/visit". If the user names a page, look up its numeric id from <site_pages> first.',
			},
			refresh_navigation: {
				type: 'boolean',
				description:
					'Set to true when navigation blocks on the destination page should be refreshed after navigation, for example after creating a new page and adding it to the navigation menu.',
			},
			summary: {
				type: 'string',
				description:
					"A short, friendly confirmation in the agent's own voice to show to the user after navigation completes.",
			},
			followUpTasks: {
				type: 'boolean',
				description:
					'Deprecated. This tool always returns to the agent with a success or error message.',
			},
		},
		required: [ 'path' ],
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
						description: 'Whether navigation completed successfully.',
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
						description: 'Optional details about the navigation target.',
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
	callback: editorNavigateCallback,
};
