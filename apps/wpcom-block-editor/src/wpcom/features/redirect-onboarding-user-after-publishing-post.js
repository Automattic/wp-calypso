import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';

export const postWasPublished = async () =>
	new Promise( ( resolve ) => {
		const unsubscribe = subscribe( () => {
			const onboardingFlag = true;

			if ( false === onboardingFlag ) {
				unsubscribe();
				return false;
			}

			const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
			const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

			if ( isCurrentPostPublished && getCurrentPostRevisionsCount === 1 ) {
				unsubscribe();
				resolve();
			}
		} );
	} );

function redirectOnboardingUserAfterPublishingPost() {
	postWasPublished().then( () => {
		console.log( 'Redirecting...' );

		window.location.href = '/setup/write/launchpad?siteSlug=paulopmt1test.wordpress.com';
	} );
}

domReady( redirectOnboardingUserAfterPublishingPost );
