import { translate } from 'i18n-calypso';

translate( 'Own your online identity with a custom domain' );
translate(
	"Find the perfect domain name and stake your claim on your corner of the web with a site address that's easy to find, share, and follow."
);
translate( 'Search a domain' );
translate( 'Get your custom domain' );
translate( 'Free for the first year!' );
translate(
	'With an annual plan, you can get {{strong}}%(domainName)s for free{{/strong}} for the first year, Jetpack essential features, live chat support, and all the features that will take your site to the next level.',
	{
		args: {
			domainName: 'example.blog',
		},
		components: {
			strong: <strong />,
		},
	}
);
translate( 'You need a plan to have a primary custom domain' );
translate( 'Any domain you purchase without a plan will get redirected to %(domainName)s.', {
	args: {
		domainName: 'example.blog',
	},
} );
translate(
	'If you upgrade to a plan, you can use your custom domain name instead of having WordPress.com in your URL.'
);
translate( 'I want my domain as primary' );
translate( 'That works for me' );
