/** @format */

/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { settings as slideshowSettings } from './settings.js';
import edit from './edit';
import save from './save';
import './style.scss';

export const { name } = slideshowSettings;

export const settings = {
	title: slideshowSettings.title,
	icon: (
		<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<Path d="M0 0h24v24H0z" fill="none" />
			<Path d="M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
		</SVG>
	),
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
