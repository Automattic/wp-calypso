import { dispatch, select, subscribe } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import useLaunchpadScreen from './use-launchpad-screen';
import useSiteIntent from './use-site-intent';

const START_WRITING_FLOW = 'start-writing';
const DESIGN_FIRST_FLOW = 'design-first';

export function RedirectOnboardingUserAfterPublishingPost() {
	const { siteIntent: intent } = useSiteIntent();
	const { launchpad_screen: launchpadScreen } = useLaunchpadScreen();

	useEffect( () => {
		// We check the URL param along with site intent because the param loads faster and prevents element flashing.
		const hasStartWritingFlowQueryArg =
			getQueryArg( window.location.search, START_WRITING_FLOW ) === 'true';

		if (
			intent === START_WRITING_FLOW ||
			intent === DESIGN_FIRST_FLOW ||
			hasStartWritingFlowQueryArg
		) {
			dispatch( 'core/edit-post' ).closeGeneralSidebar();
			document.documentElement.classList.add( 'blog-onboarding-hide' );
		}
	}, [ intent ] );

	if ( intent !== START_WRITING_FLOW && intent !== DESIGN_FIRST_FLOW ) {
		return false;
	}

	if ( [ 'off', 'skipped' ].includes( launchpadScreen ) ) {
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

			window.location.href = `${ siteOrigin }/setup/${ intent }/launchpad?siteSlug=${ siteSlug }`;
		}
	} );
}
