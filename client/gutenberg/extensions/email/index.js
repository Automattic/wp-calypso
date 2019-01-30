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
		<Path
			fill-opacity=".9"
			d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
		/>
	),
	category: 'jetpack',
	attributes,
	edit,
	save,
};
