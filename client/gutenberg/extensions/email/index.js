/** @format */
/**
 * External dependencies
 */
import { Path } from '@wordpress/components';

/**
 * Internal dependencies
 */
import edit from './edit';
import renderMaterialIcon from 'gutenberg/extensions/presets/jetpack/utils/render-material-icon';

const attributes = {
	email: {
		type: 'string',
		default: '',
	},
};

const save = ( { attributes: { email }, className } ) => (
	<div className={ className }>
		<a href={ `mailto:${ email }` } itemprop="email">
			{ email }
		</a>
	</div>
);

export const name = 'email';

export const settings = {
	title: 'Email Address',
	icon: renderMaterialIcon(
		<Path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
	),
	category: 'jetpack',
	attributes,
	edit,
	save,
	parent: [ 'jetpack/contact-info' ],
};
