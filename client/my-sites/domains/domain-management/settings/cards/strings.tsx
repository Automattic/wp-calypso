import { useTranslate } from 'i18n-calypso';

() => {
	const translate = useTranslate();
	translate( 'Advanced settings' );
	translate( 'Redirect type' );
	translate( 'Select the HTTP redirect type' );
	translate( 'Temporary redirect (302)' );
	translate( 'Temporary redirect (307)' );
	translate( 'Enables quick propagation of changes to your forwarding address.' );
	translate( 'Permanent redirect (301)' );
	translate(
		'Enables browser caching of the forwarding address for quicker resolution. Note that changes might take longer to fully propagate.'
	);
	translate( 'Path forwarding' );
	translate(
		'Redirects the path after the domain name to the corresponding path at the new address.'
	);
	translate( 'Do not forward' );
	translate( 'Forward path' );
};
