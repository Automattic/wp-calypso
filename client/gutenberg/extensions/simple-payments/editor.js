/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import GridiconMoney from 'gridicons/dist/money';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

registerBlockType( 'jetpack/simple-payments', {
	title: __( 'Payment button', 'jetpack' ),

	description: __(
		'Simple Payments lets you create and embed credit and debit card payment buttons on your WordPress.com and Jetpack-enabled sites with minimal setup.',
		'jetpack'
	),

	icon: <GridiconMoney />,

	category: 'jetpack',

	keywords: [ 'simple payments', 'PayPal' ],

	attributes: {
		content: {
			type: 'string',
			default: '',
		},
		paymentId: {
			type: 'number',
		},
		title: {
			type: 'string',
			default: '',
		},
		price: {
			type: 'number',
		},
		currency: {
			type: 'string',
			default: 'USD',
		},
		cta: {
			type: 'string',
			default: '',
		},
		multiple: {
			type: 'number',
			default: 0,
		},
		email: {
			type: 'string',
			default: '',
		},
		formatted_price: {
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
