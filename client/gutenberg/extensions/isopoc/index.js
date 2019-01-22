/** @format */

/**
 * Internal dependencies
 */
import { settings as isopocSettings } from './settings.js';
import edit from './edit';
import save from './save';
import './style.scss';
import './editor.scss';

export const { name } = isopocSettings;

export const settings = {
	title: isopocSettings.title,
	icon: isopocSettings.icon,
	category: isopocSettings.category,
	description: isopocSettings.description,
	attributes: isopocSettings.attributes,
	supports: isopocSettings.supports,
	edit,
	save,
};
