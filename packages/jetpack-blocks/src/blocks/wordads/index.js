/**
 * External dependencies
 */
import { ExternalLink, Path, SVG } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';
import edit from './edit';
import { DEFAULT_FORMAT } from './constants';

export const name = 'wordads';
export const title = __( 'Ad' );

export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path fill="none" d="M0 0h24v24H0V0z" />
		<Path d="M12,8H4A2,2 0 0,0 2,10V14A2,2 0 0,0 4,16H5V20A1,1 0 0,0 6,21H8A1,1 0 0,0 9,20V16H12L17,20V4L12,8M15,15.6L13,14H4V10H13L15,8.4V15.6M21.5,12C21.5,13.71 20.54,15.26 19,16V8C20.53,8.75 21.5,10.3 21.5,12Z" />
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
		hideMobile: {
			type: 'boolean',
			default: false,
		},
	},

	category: 'jetpack',

	keywords: [ __( 'ads' ), 'WordAds', __( 'Advertisement' ) ],

	supports: {
		align: [ 'left', 'center', 'right' ],
		alignWide: false,
		className: false,
		customClassName: false,
		html: false,
		reusable: false,
	},
	edit,
	save: () => null,
};
