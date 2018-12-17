/** @format */

/**
 * Internal dependencies
 */
import { settings as giphySettings } from './settings.js';
import edit from './edit';
import save from './save';
import './editor.scss';
import './style.scss';

export const { name } = giphySettings;

export const settings = {
	title: giphySettings.title,
	icon: giphySettings.icon,
	category: giphySettings.category,
	keywords: giphySettings.keywords,
	description: giphySettings.description,
	attributes: giphySettings.attributes,
	supports: giphySettings.supports,
	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		return { 'data-align': align };
	},
	edit,
	save,
};
