import { useTranslate } from 'i18n-calypso';

() => {
	const translate = useTranslate();
	translate( 'Advanced settings' );
	translate( 'Redirect type' );
	translate( 'Select the HTTP redirect type' );
	translate( 'Temporary redirect' );
	translate( 'Enables quick propagation of changes to your forwarding address.' );
	translate( 'Permanent redirect' );
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
