/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/* eslint-disable wpcalypso/jsx-classname-namespace */

import { LocaleProvider, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';
import { Guide, GuidePage } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { getQueryArg } from '@wordpress/url';
import { ShouldShowFirstPostPublishedModalProvider } from '../../dotcom-fse/lib/first-post-published-modal/should-show-first-post-published-modal-context';
import { HasSeenSellerCelebrationModalProvider } from '../../dotcom-fse/lib/seller-celebration-modal/has-seen-seller-celebration-modal-context';
import { HasSeenVideoCelebrationModalProvider } from '../../dotcom-fse/lib/video-celebration-modal/has-seen-video-celebration-modal-context';
import DraftPostModal from './draft-post-modal';
import FirstPostPublishedModal from './first-post-published-modal';
import PurchaseNotice from './purchase-notice';
import SellerCelebrationModal from './seller-celebration-modal';
// import PostPublishedSharingModal from './sharing-modal';
import { DEFAULT_VARIANT, BLANK_CANVAS_VARIANT } from './store';
import VideoPressCelebrationModal from './video-celebration-modal';
import WpcomNux from './welcome-modal/wpcom-nux';
import LaunchWpcomWelcomeTour from './welcome-tour/tour-launch';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I know using unstable features means my plugin or theme will inevitably break on the next WordPress release.',
	'@wordpress/edit-site'
);

function WelcomeTour() {
	const [ showDraftPostModal ] = useState(
		getQueryArg( window.location.href, 'showDraftPostModal' )
	);

	const {
		show,
		isLoaded,
		variant,
		isManuallyOpened,
		isNewPageLayoutModalOpen,
		siteEditorCanvasMode,
	} = useSelect( ( select ) => {
		const welcomeGuideStoreSelect = select( 'automattic/wpcom-welcome-guide' );
		const starterPageLayoutsStoreSelect = select( 'automattic/starter-page-layouts' );
		const _canvasMode =
			select( 'core/edit-site' ) && unlock( select( 'core/edit-site' ) ).getCanvasMode();
		return {
			show: welcomeGuideStoreSelect.isWelcomeGuideShown(),
			isLoaded: welcomeGuideStoreSelect.isWelcomeGuideStatusLoaded(),
			variant: welcomeGuideStoreSelect.getWelcomeGuideVariant(),
			isManuallyOpened: welcomeGuideStoreSelect.isWelcomeGuideManuallyOpened(),
			isNewPageLayoutModalOpen: starterPageLayoutsStoreSelect?.isOpen(), // Handle the case where SPT is not initalized.
			siteEditorCanvasMode: _canvasMode,
		};
	}, [] );

	const setOpenState = useDispatch( 'automattic/starter-page-layouts' )?.setOpenState;

	const { fetchWelcomeGuideStatus } = useDispatch( 'automattic/wpcom-welcome-guide' );

	// On mount check if the WPCOM welcome guide status exists in state (from local storage), otherwise fetch it from the API.
	useEffect( () => {
		if ( ! isLoaded ) {
			fetchWelcomeGuideStatus();
		}
	}, [ fetchWelcomeGuideStatus, isLoaded ] );

	if ( ! show || isNewPageLayoutModalOpen ) {
		return null;
	}

	// Hide the Welcome Tour when not in the edit mode. Note that canvas mode is available only in the site editor
	if ( siteEditorCanvasMode && siteEditorCanvasMode !== 'edit' ) {
		return null;
	}

	// Open patterns panel before Welcome Tour if necessary (e.g. when using Blank Canvas theme)
	// Do this only when Welcome Tour is not manually opened.
	// NOTE: at the moment, 'starter-page-templates' assets are not loaded on /site-editor/ page so 'setOpenState' may be undefined
	if ( variant === BLANK_CANVAS_VARIANT && ! isManuallyOpened && setOpenState ) {
		setOpenState( 'OPEN_FOR_BLANK_CANVAS' );
		return null;
	}

	if ( variant === DEFAULT_VARIANT ) {
		return (
			<LocaleProvider localeSlug={ window.wpcomBlockEditorNuxLocale ?? i18nDefaultLocaleSlug }>
				{ showDraftPostModal ? <DraftPostModal /> : <LaunchWpcomWelcomeTour /> }
			</LocaleProvider>
		);
	}

	// This case is redundant now and it will be cleaned up in a follow-up PR
	if ( variant === 'modal' && Guide && GuidePage ) {
		return <WpcomNux />;
	}

	return null;
}

registerPlugin( 'wpcom-block-editor-nux', {
	render: () => (
		<HasSeenSellerCelebrationModalProvider>
			<HasSeenVideoCelebrationModalProvider>
				<ShouldShowFirstPostPublishedModalProvider>
					<WelcomeTour />
					<FirstPostPublishedModal />
					{ /* todo: enable once translations are complete */ }
					{ /* <PostPublishedSharingModal /> */ }
					<SellerCelebrationModal />
					<PurchaseNotice />
					<VideoPressCelebrationModal />
				</ShouldShowFirstPostPublishedModalProvider>
			</HasSeenVideoCelebrationModalProvider>
		</HasSeenSellerCelebrationModalProvider>
	),
} );
