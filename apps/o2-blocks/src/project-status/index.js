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
	registerBlockType( 'a8c/project-status', {
		title: __( 'Project status' ),
		description: __( 'Display a task overview of the status of a project.' ),
		icon,
		category: 'a8c',
		supports: {
			className: false,
			anchor: true,
		},
		attributes: {
			estimate: {
				type: 'string',
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
