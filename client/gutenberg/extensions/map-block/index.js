/**
 * External dependencies
 */

 import { registerBlockType } from '@wordpress/blocks';

 /**
 * Internal dependencies
 */

import { CONFIG } from './config.js';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

registerBlockType( CONFIG.name, {
	title: CONFIG.title,
	icon: CONFIG.icon,
	category: CONFIG.category,
	keywords: CONFIG.keywords,
	attributes: CONFIG.attributes,
	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( -1 !== CONFIG.validAlignments.indexOf( align ) ) {
			return { 'data-align': align };
		}
	},
	edit,
	save
} );
