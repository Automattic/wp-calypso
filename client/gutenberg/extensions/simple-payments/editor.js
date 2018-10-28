/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter, registerBlockType } from '@wordpress/blocks';
import GridiconMoney from 'gridicons/dist/money';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

const blockName = 'jetpack/simple-payments';

/*
 * Ensure we can load blocks containing valid shortcode even without attributes:
 *
 * Turns this:
 * ```
 * <!-- wp:jetpack/simple-payments -->
 * [simple-payment id="324"]
 * <!-- /wp:jetpack/simple-payments -->
 * ```
 *
 * Into:
 * ```
 * <!-- wp:jetpack/simple-payments {"paymentId":"324"} -->
 * [simple-payment id="324"]
 * <!-- /wp:jetpack/simple-payments -->
 * ```
 */
const getBlockAttributes = ( attributes, blockType, blockContent ) => {
	if ( blockType.name !== blockName ) {
		return attributes;
	}

	const shortcode = /\[simple-payment\s+id="(\d+)"\]/;
	const [ , paymentId ] = shortcode.exec( blockContent );

	if ( paymentId ) {
		attributes.paymentId = paymentId;
	}

	return attributes;
};

addFilter( 'blocks.getBlockAttributes', `${ blockName }-block-attributes`, getBlockAttributes );

registerBlockType( blockName, {
	title: __( 'Payment button', 'jetpack' ),

	description: __(
		'Simple Payments lets you create and embed credit and debit card payment buttons on your WordPress.com and Jetpack-enabled sites with minimal setup.',
		'jetpack'
	),

	icon: <GridiconMoney />,

	category: 'jetpack',

	keywords: [ 'simple payments', 'PayPal' ],

	attributes: {
		paymentId: {
			type: 'number',
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
