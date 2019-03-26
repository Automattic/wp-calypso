/**
 * External dependencies
 */
import { Rect, SVG } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';
import edit from './edit';

export const name = 'testimonial';
export const title = __( 'Testimonial' );

export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Rect x="0" y="0" width="24" height="24" fill="hotpink" />
	</SVG>
);

export const settings = {
	title,

	description: (
		<Fragment>
			<p>{ __( 'Testimonial description…' ) }</p>
		</Fragment>
	),

	icon,
	attributes: {
		align: {
			type: 'string',
			default: 'center',
		},
	},

	category: 'jetpack',

	keywords: [ __( 'testimonial' ), 'reference' ],

	supports: {
		align: [ 'left', 'center', 'right' ],
		alignWide: false,
		className: false,
		customClassName: false,
		html: false,
	},
	edit,
	save: () => null,
};
