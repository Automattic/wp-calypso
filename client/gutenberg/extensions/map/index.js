/**
 * Internal dependencies
 */
import { settings as mapSettings } from './settings.js';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

export const { name } = mapSettings;

export const settings = {
	title: mapSettings.title,
	icon: mapSettings.icon,
	category: mapSettings.category,
	keywords: mapSettings.keywords,
	description: mapSettings.description,
	attributes: mapSettings.attributes,
	supports: mapSettings.supports,
	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( -1 !== mapSettings.validAlignments.indexOf( align ) ) {
			return { 'data-align': align };
		}
	},
	edit,
	save,
};
