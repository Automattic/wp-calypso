/**
 * External dependencies
 */
import { Path } from '@wordpress/components';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import renderMaterialIcon from '../../../utils/render-material-icon';
import { __, _x } from '../../../utils/i18n';

const attributes = {
	phone: {
		type: 'string',
		default: '',
	},
};

export const name = 'phone';

export const settings = {
	title: __( 'Phone Number' ),
	description: __(
		'Lets you add a phone number with an automatically generated click-to-call link.'
	),
	keywords: [
		_x( 'mobile', 'block search term' ),
		_x( 'telephone', 'block search term' ),
		_x( 'cell', 'block search term' ),
	],
	icon: renderMaterialIcon(
		<Path d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z" />
	),
	category: 'jetpack',
	attributes,
	parent: [ 'jetpack/contact-info' ],
	edit,
	save,
};
