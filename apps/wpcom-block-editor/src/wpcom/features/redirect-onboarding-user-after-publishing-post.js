import { dispatch, select, subscribe, useSelect } from '@wordpress/data';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import useLaunchpadScreen from './use-launchpad-screen';
import useSiteIntent from './use-site-intent';

const START_WRITING_FLOW = 'start-writing';

export function RedirectOnboardingUserAfterPublishingPost() {
	const { siteIntent: intent } = useSiteIntent();
	const { launchpad_screen: launchpadScreen } = useLaunchpadScreen();

	const currentPostType = useSelect(
		( localSelect ) => localSelect( 'core/editor' ).getCurrentPostType(),
		[]
	);

	// Check the URL parameter first so we can skip later processing ASAP and avoid flashing.
	const hasStartWritingFlowQueryArg =
		getQueryArg( window.location.search, START_WRITING_FLOW ) === 'true';

	const shouldShowMinimalUIAndRedirectToFullscreenLaunchpad =
		intent === START_WRITING_FLOW &&
		hasStartWritingFlowQueryArg &&
		'full' === launchpadScreen &&
		currentPostType === 'post';
	const postFlowUrl = getQueryArg( window.location.search, 'postFlowUrl' );

	useEffect( () => {
		if ( shouldShowMinimalUIAndRedirectToFullscreenLaunchpad ) {
			dispatch( 'core/edit-post' ).closeGeneralSidebar();
			document.documentElement.classList.add( 'blog-onboarding-hide' );
		} else {
			document.documentElement.classList.remove( 'blog-onboarding-hide' );
		}
	}, [ shouldShowMinimalUIAndRedirectToFullscreenLaunchpad ] );

	if ( ! shouldShowMinimalUIAndRedirectToFullscreenLaunchpad ) {
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

			// Redirect to the post flow URL if it's provided, otherwise redirect to the launchpad.
			window.location.href = postFlowUrl
				? `${ siteOrigin }${ postFlowUrl }`
				: `${ siteOrigin }/setup/${ intent }/launchpad?siteSlug=${ siteSlug }`;
		}
	} );
}
