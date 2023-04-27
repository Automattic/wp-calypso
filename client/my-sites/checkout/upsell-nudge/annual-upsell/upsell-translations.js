import { translate } from 'i18n-calypso';

translate( 'Switch to an Annual Plan and Save %(savings)d%', {
	args: {
		savings: 30,
	},
	comment: '%(savings)d is a numeric discount percentage, e.g. 30',
} );
translate(
	'When choosing annual billing, you’ll save on your WordPress.com subscription and get a custom domain name free for the first year.'
);
translate( 'That’s a total savings of %(savingsPrice)s!', {
	args: {
		discountPrice: '$25',
	},
	comment: '%(savingsPrice)s is a monetary value, e.g. $25',
} );
translate( 'Ready to start saving? Click {{strong}}Add to cart{{/strong}} below to get started.', {
	components: { strong: <strong /> },
} );

translate( 'Add to cart' );
translate( 'Consider later' );
