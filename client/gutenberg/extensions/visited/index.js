/** @format */
/**
 * Internal dependencies
 */
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './components/edit';
import save from './components/save';
import { CRITERIA_AFTER, DEFAULT_THRESHOLD } from './constants';
import './editor.scss';

export const name = 'visited';
export const settings = {
	attributes: {
		criteria: {
			type: 'string',
			default: CRITERIA_AFTER,
		},
		threshold: {
			type: 'number',
			default: DEFAULT_THRESHOLD,
		},
	},
	category: 'jetpack',
	description: __( 'Control block visibility based on how often a visitor has viewed the page.' ),
	icon: 'history',
	keywords: [
		_x( 'traffic', 'block search term' ),
		_x( 'visitors', 'block search term' ),
		_x( 'visibility', 'block search term' ),
	],
	supports: { html: false },
	title: __( 'Repeat Visitor' ),
	edit,
	save,
};
