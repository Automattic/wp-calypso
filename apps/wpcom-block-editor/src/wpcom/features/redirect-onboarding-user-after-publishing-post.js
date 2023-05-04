import { dispatch, select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { getQueryArg } from '@wordpress/url';

const START_WRITING_FLOW = 'start-writing';

export function redirectOnboardingUserAfterPublishingPost() {
	const isStartWritingFlow = getQueryArg( window.location.search, START_WRITING_FLOW ) === 'true';

	if ( ! isStartWritingFlow ) {
		return false;
	}

	const siteOrigin = getQueryArg( window.location.search, 'origin' );
	const siteSlug = window.location.hostname;

	const unsubscribeSidebar = subscribe( () => {
		const isComplementaryAreaVisible = select( 'core/preferences' ).get(
			'core/edit-post',
			'isComplementaryAreaVisible'
		);

		if ( isComplementaryAreaVisible ) {
			dispatch( 'core/edit-post' ).closeGeneralSidebar();
			unsubscribeSidebar();
		}
	} );

	const unsubscribe = subscribe( () => {
		const isSavingPost = select( 'core/editor' ).isSavingPost();
		const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
		const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

		if ( ! isSavingPost && isCurrentPostPublished && getCurrentPostRevisionsCount === 1 ) {
			unsubscribe();

			dispatch( 'core/edit-post' ).closePublishSidebar();
			window.location.href = `${ siteOrigin }/setup/start-writing/launchpad?siteSlug=${ siteSlug }&${ START_WRITING_FLOW }=true`;
		}
	} );
}

domReady( redirectOnboardingUserAfterPublishingPost );
