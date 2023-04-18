import { select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { getQueryArg } from '@wordpress/url';
import { updateLaunchpadSettings } from 'calypso/data/sites/use-launchpad';

/**
 * This function marks 'Write your first post' as completed in the launchpad.
 */
async function setFirstPostAsPublished( siteSlug ) {
	await updateLaunchpadSettings( siteSlug, {
		checklist_statuses: { first_post_published: true },
	} );
}

export function redirectOnboardingUserAfterPublishingPost() {
	const showLaunchpad = getQueryArg( window.location.search, 'showLaunchpad' );

	if ( 'true' !== showLaunchpad ) {
		return false;
	}

	const siteOrigin = getQueryArg( window.location.search, 'origin' );
	const siteSlug = window.location.hostname;

	const unsubscribe = subscribe( () => {
		const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
		const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

		if ( isCurrentPostPublished && getCurrentPostRevisionsCount === 1 ) {
			unsubscribe();
			setFirstPostAsPublished( siteSlug );

			window.location.href =
				siteOrigin + '/setup/write/launchpad?siteSlug=' + siteSlug + '&showLaunchpad=true';
		}
	} );
}

domReady( redirectOnboardingUserAfterPublishingPost );
