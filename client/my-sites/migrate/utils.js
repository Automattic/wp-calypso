import { addQueryArgs } from '@wordpress/url';

export function goToMigrationFlow( siteSlug, from ) {
	const flow = '/setup/site-migration';
	window.location.replace( siteSlug || from ? addQueryArgs( flow, { siteSlug, from } ) : flow );
}
