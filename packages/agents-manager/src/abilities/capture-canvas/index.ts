import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { captureCanvasCallback } from './callback';
import type { Ability } from '../types';

/**
 * Lets the agent look at the page whenever it needs to: `apply-block-edits`
 * captures only the edit it just made, and a global styles write, custom CSS
 * or a change the user made is where the data the agent wrote is least likely
 * to match what the user sees. The `big-sky/` name and category are the keys
 * the backend route allowlists match on — renaming either drops the ability
 * from every surface.
 */
export const captureCanvasAbility: Ability = {
	name: 'big-sky/capture-canvas',
	label: __( 'Capture Canvas', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		'Takes a picture of the editor canvas as it currently renders, including unsaved changes. Use it to check how the page actually looks when the block data alone cannot answer that — after changing styles, colours, spacing or CSS, or whenever a reported problem is visual. Pass fullPage to see the whole page at once, which is what a theme or global styles change needs checking against. Photographs are replaced by flat placeholder boxes at their real size.',
	input_schema: {
		type: 'object',
		properties: {
			clientIds: {
				type: 'array',
				items: { type: 'string' },
				description:
					'Blocks to centre the picture on. Omit to capture the visible area of the canvas. Naming the blocks in question is what guarantees they are in frame, since the user may be scrolled elsewhere. Ignored when fullPage is set.',
			},
			fullPage: {
				type: 'boolean',
				description:
					'Capture the entire page from top to bottom rather than one screenful. The result is scaled down to fit, so body text is not legible — use it to judge colour, type scale, spacing and section rhythm after a theme or global styles change, then take an ordinary picture of a specific area when the wording or fine detail matters.',
			},
		},
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether an image was produced.',
					},
					message: {
						type: 'string',
						description: 'Human-readable description of the capture.',
					},
					error: {
						type: 'string',
						description: 'Why no image was produced.',
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: {
				type: 'boolean',
			},
			__file_parts: {
				type: 'array',
				description:
					'The captured image, sent alongside the result rather than inside it. Absent when no image was produced.',
			},
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: captureCanvasCallback,
};
