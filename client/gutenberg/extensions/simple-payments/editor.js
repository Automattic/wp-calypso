/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import GridiconMoney from 'gridicons/dist/money';

registerBlockType( 'a8c/simple-payment', {
	title: __( 'Simple Payment', 'jetpack' ),

	description: <p>{ __( 'Payment Button', 'jetpack' ) }</p>,

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

	save: x => x,
} );
