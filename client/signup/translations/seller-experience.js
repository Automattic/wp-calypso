import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';

// Set up your store
translate( 'Set up your store' );
translate( "Let's make sure you have everything you need to sell online." );
translate( 'Start simple' );
translate(
	'Ideal if you’re looking to accept donations or sell one or two products without needing to manage shipping.'
);
translate( 'Powered by {{a}}Payment Blocks{{/a}}', {
	components: {
		a: (
			<a
				href={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/payments/' ) }
			/>
		),
	},
} );
translate( 'Continue' );
translate( 'Start with more' );
translate( 'Requires a {{a}}paid plan{{/a}}', {
	components: {
		a: <a href="/plans/" />,
	},
} );
translate( 'Requires a {{a}}Business plan{{/a}}', {
	components: {
		a: <a href="/plans/" />,
	},
} );
translate( 'Included in your {{a}}plan{{/a}}', {
	components: {
		a: <a href="/plans/" />,
	},
} );
translate(
	'If you have multiple products or require extensive order and shipping management than this might suit your needs better.'
);
translate( 'Powered by {{a}}WooCommerce{{/a}}', {
	components: {
		a: <a href={ localizeUrl( 'https://wordpress.com/support/introduction-to-woocommerce/' ) } />,
	},
} );
translate( 'Upgrade' );

// Published a product
translate( 'Your product is live!' );
translate(
	'People can now buy your product online. Start sharing your product with friends and family.'
);

// Tell us about your business
translate( 'What type of products will be listed? {{span}}(optional){{/span}}', {
	components: {
		span: <span />,
	},
} );
translate( 'How many products do you want to sell? {{span}}(optional){{/span}}', {
	components: {
		span: <span />,
	},
} );
translate( 'Are you already selling? {{span}}(optional){{/span}}', {
	components: {
		span: <span />,
	},
} );

// Name your store
translate( 'Store name {{span}}(optional){{/span}}', {
	components: {
		span: <span />,
	},
} );
translate( 'Description {{span}}(optional){{/span}}', {
	components: {
		span: <span />,
	},
} );
