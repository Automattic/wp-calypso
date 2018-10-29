/** @format */

/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import GridiconMoney from 'gridicons/dist/money';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

registerBlockType( 'jetpack/simple-payments', {
	title: __( 'Payment button' ),

	description: __(
		'Simple Payments lets you create and embed credit and debit card payment buttons on your WordPress.com and Jetpack-enabled sites with minimal setup.'
	),

	icon: <GridiconMoney />,

	category: 'jetpack',

	keywords: [ __( 'simple payments' ), 'PayPal' ],

	attributes: {
		currency: {
			type: 'string',
			default: 'USD',
		},
		description: {
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
