import { dispatch, select, subscribe } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import useSiteIntent from './use-site-intent';

const START_WRITING_FLOW = 'start-writing';

export function RedirectOnboardingUserAfterPublishingPost() {
	const { siteIntent: intent } = useSiteIntent();

	if ( intent !== START_WRITING_FLOW ) {
		return false;
	}

	const siteOrigin =
		getQueryArg( window.location.search, 'origin' ) ||
		window.sessionStorage.getItem( 'site-origin' ) ||
		'https://wordpress.com';
	const siteSlug = window.location.hostname;

	// Save site origin in session storage to be used in editor refresh.
	window.sessionStorage.setItem( 'site-origin', siteOrigin );

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
		const isCurrentPostScheduled = select( 'core/editor' ).isCurrentPostScheduled();
		const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

		if (
			! isSavingPost &&
			( isCurrentPostPublished || isCurrentPostScheduled ) &&
			getCurrentPostRevisionsCount === 1
		) {
			unsubscribe();

			dispatch( 'core/edit-post' ).closePublishSidebar();
			window.location.href = `${ siteOrigin }/setup/start-writing/launchpad?siteSlug=${ siteSlug }&${ START_WRITING_FLOW }=true`;
		}
	} );
}
