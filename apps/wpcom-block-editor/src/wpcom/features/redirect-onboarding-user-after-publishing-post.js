import { dispatch, select, subscribe } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import useLaunchpadTasksCompleted from './use-launchpad';

const START_WRITING_FLOW = 'start-writing';

export function RedirectOnboardingUserAfterPublishingPost() {
	// const { siteIntent: intent } = useSiteIntent();
	const {
		launchpadSiteIntent: intent,
		launchpadTasksCompleted,
		launchpadFetched,
	} = useLaunchpadTasksCompleted();

	useEffect( () => {
		// We check the URL param along with site intent because the param loads faster and prevents element flashing.
		const hasStartWritingFlowQueryArg =
			getQueryArg( window.location.search, START_WRITING_FLOW ) === 'true';

		const hasStartWritingFlowActiveFromApi = launchpadFetched
			? intent === START_WRITING_FLOW && ! launchpadTasksCompleted
			: false;

		if ( hasStartWritingFlowActiveFromApi || hasStartWritingFlowQueryArg ) {
			dispatch( 'core/edit-post' ).closeGeneralSidebar();
			document.documentElement.classList.add( 'start-writing-hide' );
		}
	}, [ intent, launchpadTasksCompleted, launchpadFetched ] );

	// Wait for API calls to return before going to the next step.
	if ( ! launchpadFetched ) {
		return false;
	}

	if ( intent !== START_WRITING_FLOW ) {
		return false;
	}

	// If the user has already completed the launchpad tasks,
	// treat this post as a regular post and don't do anything else.
	if ( launchpadTasksCompleted ) {
		return false;
	}

	// Save site origin in session storage to be used in editor refresh.
	const siteOriginParam = getQueryArg( window.location.search, 'origin' );
	if ( siteOriginParam ) {
		window.sessionStorage.setItem( 'site-origin', siteOriginParam );
	}

	const siteOrigin = window.sessionStorage.getItem( 'site-origin' ) || 'https://wordpress.com';
	const siteSlug = window.location.hostname;

	const unsubscribe = subscribe( () => {
		const isSavingPost = select( 'core/editor' ).isSavingPost();
		const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
		const isCurrentPostScheduled = select( 'core/editor' ).isCurrentPostScheduled();
		const getCurrentPostRevisionsCount = select( 'core/editor' ).getCurrentPostRevisionsCount();

		if (
			! isSavingPost &&
			( isCurrentPostPublished || isCurrentPostScheduled ) &&
			getCurrentPostRevisionsCount >= 1
		) {
			unsubscribe();
			dispatch( 'core/edit-post' ).closePublishSidebar();
			window.location.href = `${ siteOrigin }/setup/start-writing/launchpad?siteSlug=${ siteSlug }&${ START_WRITING_FLOW }=true`;
		}
	} );
}
