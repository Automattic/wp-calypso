/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './editor';
import save from './save';
import icon from './icon';

export function registerBlock() {
	registerBlockType( 'a8c/task', {
		title: __( 'Task' ),
		description: __( 'Create task items and check them when completed.' ),
		icon,
		category: 'a8c',
		keywords: [ __( 'todo' ), __( 'task' ) ],
		supports: {
			className: false,
			anchor: true,
		},
		attributes: {
			content: {
				type: 'array',
				source: 'children',
				selector: 'p',
			},
			checked: {
				type: 'boolean',
			},
			assignedTo: {
				type: 'string',
			},
			placeholder: {
				type: 'string',
			},
			status: {
				type: 'string',
				default: 'new',
			},
			dueDate: {
				type: 'string',
				default: '',
			},
			startDate: {
				type: 'string',
				default: '',
			},
		},

		edit,
		save,
	} );
}

registerBlock();
