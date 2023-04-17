import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { getQueryArg } from '@wordpress/url';

const siteOrigin = getQueryArg( window.location.search, 'origin' );
const showLaunchpad = getQueryArg( window.location.search, 'showLaunchpad' );

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
	if ( 'true' !== showLaunchpad ) {
		return false;
	}

	postWasPublished().then( () => {
		const siteSlug = window.location.hostname;
		window.location.href = siteOrigin + '/setup/write/launchpad?siteSlug=' + siteSlug;
	} );
}

domReady( redirectOnboardingUserAfterPublishingPost );
