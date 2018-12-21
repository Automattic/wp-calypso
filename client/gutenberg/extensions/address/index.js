/** @format */
/**
 * External dependencies
 */
import { Path, Circle } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import renderMaterialIcon from 'gutenberg/extensions/presets/jetpack/utils/render-material-icon';
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const attributes = {
	address: {
		type: 'string',
		default: '',
	},
	address_line2: {
		type: 'string',
		default: '',
	},
	address_line3: {
		type: 'string',
		default: '',
	},
	city: {
		type: 'string',
		default: '',
	},
	region: {
		type: 'string',
		default: '',
	},
	postal: {
		type: 'string',
		default: '',
	},
	country: {
		type: 'string',
		default: '',
	},
};

export const name = 'address';

export const settings = {
	title: __( 'Address' ),
	description: (
		<Fragment>
			<p>{ __( 'Lets you add a physical address with Schema markup.' ) }</p>
		</Fragment>
	),
	keywords: [
		_x( 'location', 'block search term' ),
		_x( 'direction', 'block search term' ),
		_x( 'place', 'block search term' ),
	],
	icon: renderMaterialIcon(
		<Fragment>
			<Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z" />
			<Circle cx="12" cy="9" r="2.5" />
		</Fragment>
	),
	category: 'jetpack',
	attributes,
	parent: [ 'jetpack/contact-info' ],
	edit,
	save,
};
