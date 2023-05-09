import { dispatch, select, subscribe } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import useSiteIntent from './use-site-intent';

const START_WRITING_FLOW = 'start-writing';

export function RedirectOnboardingUserAfterPublishingPost() {
	const { intent } = useSiteIntent();
	console.log( 'intent', intent );

	if ( intent !== 'write' ) {
		return false;
	}
	console.log( 'we made it' );

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
