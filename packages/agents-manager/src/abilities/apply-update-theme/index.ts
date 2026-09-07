import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { applyUpdateThemeCallback } from './callback';
import type { Ability } from '../types';

const namedEntrySchema = ( valueKey: string ) => ( {
	type: 'object',
	properties: {
		name: { type: 'string' },
		slug: { type: 'string' },
		[ valueKey ]: { type: 'string' },
	},
	required: [ 'name', 'slug', valueKey ],
} );

/**
 * The `apply-update-theme` ability definition.
 *
 * The `big-sky/` name and category are the keys the backend route allowlists
 * match on — renaming either drops the ability from every surface.
 */
export const applyUpdateThemeAbility: Ability = {
	name: 'big-sky/apply-update-theme',
	label: __( 'Update Theme', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Update WordPress theme settings and styles using theme.json format',
		__i18n_text_domain__
	),
	input_schema: {
		type: 'object',
		properties: {
			settings: {
				type: [ 'object', 'null' ],
				description:
					'Theme.json settings format - contains theme settings like color palettes, typography, spacing, etc.',
				properties: {
					color: {
						type: 'object',
						description: 'Color-related theme settings',
						properties: {
							palette: {
								type: 'array',
								description: 'Array of color objects to add to the theme palette',
								items: namedEntrySchema( 'color' ),
							},
							duotone: {
								type: 'array',
								description: 'Array of duotone color combinations',
								items: {
									type: 'object',
									properties: {
										name: { type: 'string' },
										slug: { type: 'string' },
										colors: { type: 'array', items: { type: 'string' } },
									},
									required: [ 'name', 'slug', 'colors' ],
								},
							},
							gradients: {
								type: 'array',
								description: 'Array of gradient definitions',
								items: namedEntrySchema( 'gradient' ),
							},
						},
						additionalProperties: true,
					},
					typography: {
						type: 'object',
						description: 'Typography-related theme settings',
						properties: {
							fontFamilies: {
								type: 'array',
								description: 'Array of font family definitions',
								items: namedEntrySchema( 'fontFamily' ),
							},
							fontSizes: {
								type: 'array',
								description: 'Array of font size definitions',
								items: namedEntrySchema( 'size' ),
							},
						},
						additionalProperties: true,
					},
					spacing: {
						type: 'object',
						description: 'Spacing-related theme settings',
						additionalProperties: true,
					},
					layout: {
						type: 'object',
						description: 'Layout-related theme settings',
						additionalProperties: true,
					},
				},
				additionalProperties: true,
			},
			styles: {
				type: [ 'object', 'null' ],
				description:
					'Theme.json styles format - contains CSS-like styles for elements, blocks, and variations',
				properties: {
					color: {
						type: 'object',
						description: 'Global color styles',
						properties: {
							background: { type: 'string' },
							text: { type: 'string' },
						},
						additionalProperties: true,
					},
					typography: {
						type: 'object',
						description: 'Global typography styles',
						properties: {
							fontFamily: { type: 'string' },
							fontSize: { type: 'string' },
							fontWeight: { type: 'string' },
							lineHeight: { type: 'string' },
						},
						additionalProperties: true,
					},
					spacing: {
						type: 'object',
						description: 'Global spacing styles',
						properties: {
							padding: { type: 'string' },
							margin: { type: 'string' },
						},
						additionalProperties: true,
					},
					elements: {
						type: 'object',
						description: 'Styles for HTML elements like links, buttons, headings',
						additionalProperties: { type: 'object', additionalProperties: true },
					},
					blocks: {
						type: 'object',
						description: 'Styles for specific WordPress blocks',
						additionalProperties: { type: 'object', additionalProperties: true },
					},
					variations: {
						type: 'object',
						description: 'Style variations',
						additionalProperties: { type: 'object', additionalProperties: true },
					},
				},
				additionalProperties: true,
			},
			summary: {
				type: 'string',
				description: 'Summary message to show to the user',
			},
			followUpTasks: {
				type: 'boolean',
				description:
					'Deprecated. This tool always returns to the agent with a success or error message.',
			},
		},
		required: [],
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the theme update was applied successfully.',
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
						description: 'Optional details about the applied theme update.',
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
	callback: applyUpdateThemeCallback,
};
