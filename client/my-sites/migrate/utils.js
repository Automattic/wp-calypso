import { addQueryArgs } from '@wordpress/url';

export function goToMigrationFlow( siteSlug ) {
	const flow = '/setup/site-migration';
	window.location.replace( siteSlug ? addQueryArgs( flow, { siteSlug } ) : flow );
}
