/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './editor';
import save from './save';

export function registerBlock() {
	registerBlockType( 'a8c/janitorial-state-widget', {
		title: 'Janitorial State Widget',
		icon: 'smiley',
		category: 'a8c',
		description: 'Display a widget to track the state of janitorial queues.',
		attributes: {
			title: {
				type: 'array',
				source: 'children',
				selector: 'h2',
			},
			tiers: {
				type: 'array',
				default: [],
			},
			selected: {
				type: 'string',
			},
			id: {
				type: 'integer',
				default: -1,
			},
			isPreview: {
				type: 'boolean',
				default: false,
			},
		},
		example: {
			attributes: {
				title: 'Janitorial State Widget',
				tiers: [
					{
						name: 'Tier 1 ( 8 issues )',
					},
					{
						name: 'Tier 2 ( 5 issues )',
					},
					{
						name: 'Tier 3 ( 3 issues )',
					},
					{
						name: 'Zendesk',
					},
				],
				selected: 'Tier 2 ( 5 issues )',
				id: 1,
				isPreview: true,
			},
		},
		edit,
		save,
	} );
}

registerBlock();
