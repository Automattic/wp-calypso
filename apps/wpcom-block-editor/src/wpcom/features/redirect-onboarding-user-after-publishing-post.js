import { dispatch, select, subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { getQueryArg } from '@wordpress/url';

const START_WRITING_FLOW = 'start-writing';

export function redirectOnboardingUserAfterPublishingPost() {
	const isStartWritingFlow = getQueryArg( window.location.search, START_WRITING_FLOW ) === 'true';
	const isStartWritingFlowInSessionStorage =
		window.sessionStorage.getItem( 'declarative-flow' ) === START_WRITING_FLOW;

	if ( ! isStartWritingFlow && ! isStartWritingFlowInSessionStorage ) {
		return false;
	}

	const siteOrigin =
		getQueryArg( window.location.search, 'origin' ) ||
		window.sessionStorage.getItem( 'site-origin' );
	const siteSlug = window.location.hostname;

	// Save site origin and flow in session storage to be used in editor refresh.
	window.sessionStorage.setItem( 'site-origin', siteOrigin );
	window.sessionStorage.setItem( 'declarative-flow', START_WRITING_FLOW );

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

		if ( ! isSavingPost && isCurrentPostPublished ) {
			unsubscribe();

			dispatch( 'core/edit-post' ).closePublishSidebar();
			window.location.href = `${ siteOrigin }/setup/start-writing/launchpad?siteSlug=${ siteSlug }&${ START_WRITING_FLOW }=true`;
		}
	} );
}

domReady( redirectOnboardingUserAfterPublishingPost );
