/** @format */

/**
 * Internal dependencies
 */

import { settings } from './settings.js';
import registerJetpackBlock from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-block';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

registerJetpackBlock( settings.name, {
	title: settings.title,
	icon: settings.icon,
	category: settings.category,
	keywords: settings.keywords,
	description: settings.description,
	attributes: settings.attributes,
	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( -1 !== settings.validAlignments.indexOf( align ) ) {
			return { 'data-align': align };
		}
	},
	edit,
	save,
} );
