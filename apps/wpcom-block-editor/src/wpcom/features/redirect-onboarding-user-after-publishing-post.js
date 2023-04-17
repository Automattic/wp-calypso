import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { getQueryArg } from '@wordpress/url';

const siteOrigin = getQueryArg( window.location.search, 'origin' );

export const postWasPublished = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
			const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

			if ( isCurrentPostPublished && getCurrentPostRevisionsCount === 1 ) {
				unsubscribe();
				resolve();
			}
		} );
	} );

function redirectOnboardingUserAfterPublishingPost() {
	const showLaunchpad = window.location.search.indexOf( 'showLaunchpad=true' ) !== -1;

	if ( ! showLaunchpad ) {
		return false;
	}

	postWasPublished().then( () => {
		const siteSlug = window.location.hostname;
		window.location.href = siteOrigin + '/setup/write/launchpad?siteSlug=' + siteSlug;
	} );
}

domReady( redirectOnboardingUserAfterPublishingPost );
