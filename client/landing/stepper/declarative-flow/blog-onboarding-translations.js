import { translate } from 'i18n-calypso';
import { createElement } from 'react';

/* Binary selection page */
translate( 'Start writing' );
translate( 'Pick a design first' );

/* Launchpad page */
translate( "Your blog's almost ready." );
translate( "Your blog's ready to launch!" );
translate( 'Keep the momentum going with these final steps.' );
translate( 'Write your first post' );
translate( 'Set up your blog' );
translate( 'Launch your blog' );
translate( 'Checkout and launch' );

/* Setup blog page */
translate( 'Make it yours.' );
translate( 'Give your blog a name' );
translate( 'A catchy name to make your blog memorable' );
translate( 'Add a brief description' );
translate( "Let people know what your blog's about" );
translate( 'Save and continue' );

/* Pick a domain page */
translate(
	'Help your blog stand out with a custom domain. Not sure yet? {{laterLink}}Decide later.{{/laterLink}}',
	{
		components: { strong: createElement( 'a' ) },
	}
);

/* Pick a domain modal */
translate( 'Custom domains require a paid plan.' );
translate(
	'Your previous selection of Free plan comes with a wordpress.blog subdomain. If you’d rather keep your custom address, choose any plan, from Personal up.'
);
translate( 'Upgrade to Personal' );
translate( 'Continue with Free plan' );
translate( 'Free for one year' );

/* Pick a plan */
translate( 'Free domain for the first year' );

/* Post purchase UI */
translate( "Your blog's ready!" );
translate( 'Now it’s time to connect your social accounts.' );
translate( 'Visit your blog' );
translate( 'Connect to social' );
