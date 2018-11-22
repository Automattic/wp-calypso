/** @format */

/**
 * External dependencies
 */
import { ExternalLink, Path, SVG } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import { DEFAULT_CURRENCY } from 'lib/simple-payments/constants';
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import registerJetpackBlock from 'gutenberg/extensions/presets/jetpack/utils/register-jetpack-block';

/**
 * Styles
 */
import './editor.scss';

export const name = 'simple-payments';

export const settings = {
	title: __( 'Simple Payments button' ),

	description: (
		<Fragment>
			<p>
				{ __(
					'Lets you create and embed credit and debit card payment buttons with minimal setup.'
				) }
			</p>
			<ExternalLink href="https://support.wordpress.com/simple-payments/">
				{ __( 'Support reference' ) }
			</ExternalLink>
		</Fragment>
	),

	icon: (
		<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<Path fill="none" d="M0 0h24v24H0V0z" />
			<Path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
		</SVG>
	),

	category: 'jetpack',

	keywords: [ _x( 'shop', 'block search term' ), _x( 'sell', 'block search term' ), 'PayPal' ],

	attributes: {
		currency: {
			type: 'string',
			default: DEFAULT_CURRENCY,
		},
		content: {
			type: 'string',
			default: '',
		},
		email: {
			type: 'string',
			default: '',
		},
		multiple: {
			type: 'boolean',
			default: false,
		},
		paymentId: {
			type: 'number',
		},
		price: {
			type: 'number',
		},
		title: {
			type: 'string',
			default: '',
		},
	},

	transforms: {
		from: [
			{
				type: 'shortcode',
				tag: 'simple-payment',
				attributes: {
					paymentId: {
						type: 'number',
						shortcode: ( { named: { id } } ) => {
							if ( ! id ) {
								return;
							}

							const result = parseInt( id, 10 );
							if ( result ) {
								return result;
							}
						},
					},
				},
			},
		],
	},

	edit,

	save,

	supports: {
		className: false,
		customClassName: false,
		html: false,
	},
};

registerJetpackBlock( name, settings );
