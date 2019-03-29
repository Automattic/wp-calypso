/**
 * External dependencies
 */
import { Path } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __, _x } from '../../utils/i18n';
import renderMaterialIcon from '../../utils/render-material-icon';
import edit from './components/edit';
import save from './components/save';
import { CRITERIA_AFTER, DEFAULT_THRESHOLD } from './constants';
import './editor.scss';

export const name = 'repeat-visitor';
export const icon = renderMaterialIcon(
	<Path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
);
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
	icon,
	keywords: [
		_x( 'return', 'block search term' ),
		_x( 'visitors', 'block search term' ),
		_x( 'visibility', 'block search term' ),
	],
	supports: { html: false },
	title: __( 'Repeat Visitor' ),
	edit,
	save,
};
