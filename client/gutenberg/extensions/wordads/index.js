/**
 * External dependencies
 */
import { ExternalLink, Rect, SVG } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';

export const name = 'wordads';

export const settings = {
	title: __( 'Ad' ),

	description: (
		<Fragment>
			<p>{ __( 'Ads…' ) }</p>
			<ExternalLink href="#">{ __( 'Support reference' ) }</ExternalLink>
		</Fragment>
	),

	/* @TODO icon */
	icon: (
		<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
			<Rect width="24" height="24" x="0" y="0" fill="#f00" />
		</SVG>
	),

	category: 'jetpack',

	keywords: [ __( 'ads' ) ],

	supports: {
		html: false,
		align: true,
	},

	edit: edit,

	/* @TODO save */
	save: () => null,
};
