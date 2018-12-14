/** @format */
/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';
const attributes = {
	address: {
		type: 'string',
		default: '',
	},
	address_line2: {
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

const save = ( {
	attributes: { address, address_line2, city, region, postal, country },
	className,
} ) => (
	<div className={ className }>
		{ address && <div>{ address }</div> }
		{ address_line2 && <div>{ address_line2 }</div> }
		{ ( city || region || postal ) && (
			<div>{ sprintf( __( '%s, %s  %s' ), city, region, postal ) }</div>
		) }
		{ country && <div>{ country }</div> }
	</div>
);

export const name = 'address';

export const settings = {
	title: 'Address',
	icon: (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<path fill="none" d="M0 0h24v24H0V0z" />
			<path d="M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zm0 16H2V5h20v14zm-2.99-1.01L21 16l-1.51-2h-1.64c-.22-.63-.35-1.3-.35-2s.13-1.37.35-2h1.64L21 8l-1.99-1.99c-1.31.98-2.28 2.37-2.73 3.99-.18.64-.28 1.31-.28 2s.1 1.36.28 2c.45 1.61 1.42 3.01 2.73 3.99zM9 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 8.59c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V18h12v-1.41zM5.48 16c.74-.5 2.22-1 3.52-1s2.77.49 3.52 1H5.48z" />
		</svg>
	),
	category: 'jetpack',
	attributes,
	edit,
	save,
};
