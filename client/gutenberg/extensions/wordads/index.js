/**
 * External dependencies
 */
import { ExternalLink, Path, SVG } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';
import { DEFAULT_FORMAT } from './constants';

export const name = 'wordads';
export const title = __( 'Ad' );

export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
	</SVG>
);

export const settings = {
	title,

	description: (
		<Fragment>
			<p>{ __( 'Earn income by adding high quality ads to your post' ) }</p>
			<ExternalLink href="https://wordads.co/">{ __( 'Learn all about WordAds' ) }</ExternalLink>
		</Fragment>
	),

	icon,
	attributes: {
		align: {
			type: 'string',
			default: 'center',
		},
		format: {
			type: 'string',
			default: DEFAULT_FORMAT,
		},
	},

	category: 'jetpack',

	keywords: [ __( 'ads' ), 'WordAds', __( 'Advertisement' ) ],

	supports: {
		html: false,
		align: true,
	},

	edit,

	/* @TODO save */
	save: () => null,
};
