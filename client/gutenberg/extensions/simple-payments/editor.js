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
		featuredMedia: {
			type: 'number',
		},
		paymentId: {
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
