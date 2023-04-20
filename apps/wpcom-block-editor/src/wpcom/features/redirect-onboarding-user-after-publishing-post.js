import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { getQueryArg } from '@wordpress/url';

export function redirectOnboardingUserAfterPublishingPost() {
	const showLaunchpad = getQueryArg( window.location.search, 'showLaunchpad' );
	if ( 'true' !== showLaunchpad ) {
		return false;
	}

	const siteOrigin = getQueryArg( window.location.search, 'origin' );
	const siteSlug = window.location.hostname;

	const unsubscribe = subscribe( () => {
		const isSavingPost = select( 'core/editor' ).isSavingPost();
		const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
		const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

		if ( false === isSavingPost && isCurrentPostPublished && getCurrentPostRevisionsCount === 1 ) {
			unsubscribe();

			window.location.href =
				siteOrigin + '/setup/write/launchpad?siteSlug=' + siteSlug + '&showLaunchpad=true';
		}
	} );
}

domReady( redirectOnboardingUserAfterPublishingPost );
