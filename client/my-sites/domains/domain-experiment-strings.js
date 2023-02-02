import { translate } from 'i18n-calypso';

translate( 'Claim your domain' );
translate(
	'Stake your claim on your corner of the web with a custom domain name that’s easy to find, share, and follow. Not sure yet?'
);
translate( 'Decide later.' );

translate( 'Select a domain' );
translate( 'Select a plan' );
translate( 'Complete your purchase' );

translate( 'Choose the perfect plan' );
translate(
	'With your annual plan, you’ll get %(domainName) {{strong}}free for the first year{{/strong}}. You’ll also unlock advanced features that make it easy to build and grow your site.',
	{
		args: {
			domainName: 'example.blog',
		},
		components: {
			strong: <strong />,
		},
	}
);
