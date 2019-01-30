/** @format */
/**
 * External dependencies
 */
import { InnerBlocks } from '@wordpress/editor';
import { Path } from '@wordpress/components';

/**
 * Internal dependencies
 */
import edit from './edit';
import renderMaterialIcon from 'gutenberg/extensions/presets/jetpack/utils/render-material-icon';

const attributes = {};

const save = ( { className } ) => (
	<div className={ className }>
		<InnerBlocks.Content />
	</div>
);

export const name = 'contact-info';

export const settings = {
	title: 'Contact Info',
	icon: renderMaterialIcon(
		<Path d="M21 8V7l-3 2-3-2v1l3 2 3-2zm1-5H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm8-6h-8V6h8v6z" />
	),
	category: 'jetpack',
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
	},
	attributes,
	edit,
	save,
};
