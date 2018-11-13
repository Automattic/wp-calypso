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
import { DEFAULT_CURRENCY } from 'lib/simple-payments/constants';
import { __, _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

/**
 * Styles
 */
import './editor.scss';

registerBlockType( 'jetpack/simple-payments', {
	title: __( 'Simple Payments button' ),

	description: __(
		'Simple Payments lets you create and embed credit and ' +
			'debit card payment buttons with minimal setup.'
	),

	icon: <GridiconMoney />,

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
			type: 'number',
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
