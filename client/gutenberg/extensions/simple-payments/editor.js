/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import GridiconMoney from 'gridicons/dist/money';

registerBlockType( 'a8c/simple-payments', {
	title: __( 'Payment button', 'jetpack' ),

	description: __(
		'Simple Payments lets you create and embed credit and debit card payment buttons on your WordPress.com and Jetpack-enabled sites with minimal setup.',
		'jetpack'
	),

	icon: <GridiconMoney />,

	category: 'jetpack',

	keywords: [
		/** @TODO add keywords */
	],

	attributes: {
		paymentId: { type: 'number' },
	},

	edit: () => (
		<div>
			A simple payment.
			<br />
			This block is under development and not ready for production.
		</div>
	),

	save: () => null,
} );
