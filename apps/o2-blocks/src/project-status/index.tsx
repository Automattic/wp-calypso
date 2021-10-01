import { BlockDeprecation, registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import edit from './editor';
import icon from './icon';
import save from './save';
import type { BlockAttributesV1, BlockAttributes } from './types';

const v1deprecation: BlockDeprecation< BlockAttributesV1 > = {
	attributes: {
		estimate: { type: 'string' },
		team: { type: 'string', default: '' },
	},
	migrate( attributes: Record< string, unknown > ) {
		return {
			allTasks: 0,
			completedTasks: 0,
			pendingTasks: 0,
			...attributes,
		};
	},
	save() {
		return null;
	},
};

export function registerBlock() {
	registerBlockType< BlockAttributes >( 'a8c/project-status', {
		title: __( 'Project status' ),
		description: __( 'Display a task overview of the status of a project.' ),
		icon,
		category: 'a8c',
		supports: {
			className: false,
			anchor: true,
		},
		deprecated: [ v1deprecation ],
		attributes: {
			allTasks: {
				type: 'number',
				default: 0,
			},
			completedTasks: {
				type: 'number',
				default: 0,
			},
			estimate: {
				type: 'string',
			},
			pendingTasks: {
				type: 'number',
				default: 0,
			},
			team: {
				type: 'string',
				default: '',
			},
		},
		edit,
		save,
	} );
}

registerBlock();
