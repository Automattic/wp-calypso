/** @format */

/**
 * Internal dependencies
 */
import { settings as slideshowSettings } from './settings.js';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

export const { name } = slideshowSettings;

export const settings = {
	title: slideshowSettings.title,
	icon: slideshowSettings.icon,
	category: slideshowSettings.category,
	keywords: slideshowSettings.keywords,
	description: slideshowSettings.description,
	attributes: slideshowSettings.attributes,
	supports: slideshowSettings.supports,
	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( -1 !== slideshowSettings.validAlignments.indexOf( align ) ) {
			return { 'data-align': align };
		}
	},
	edit,
	save,
};
