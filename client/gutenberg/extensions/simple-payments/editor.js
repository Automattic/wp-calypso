/** @format */

/**
 * External dependencies
 */
import { ExternalLink } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import GridiconMoney from 'gridicons/dist/money';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

/**
 * Styles
 */
import './editor.scss';

registerBlockType( 'jetpack/simple-payments', {
	title: __( 'Payment button' ),

	description: (
		<Fragment>
			<p>
				{ __(
					'Simple Payments lets you create and embed credit and ' +
						'debit card payment buttons on your WordPress.com and ' +
						'Jetpack-enabled sites with minimal setup.'
				) }
			</p>
			<ExternalLink href="https://support.wordpress.com/simple-payments/">
				{ __( 'Support reference' ) }
			</ExternalLink>
		</Fragment>
	),

	icon: <GridiconMoney />,

	category: 'jetpack',

	keywords: [
		__( 'simple payments' ),
		__( 'shop' ),
		__( 'PayPal' ),
	],

	attributes: {
		currency: {
			type: 'string',
			default: 'USD',
		},
		content: {
			type: 'string',
			default: '',
		},
		email: {
			type: 'string',
			default: '',
		},
		formattedPrice: {
			type: 'string',
			default: '',
		},
		multiple: {
			type: 'number',
			default: 0,
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
} );
