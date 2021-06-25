/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { Guide, GuidePage } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { LocaleProvider, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import LaunchWpcomWelcomeTour from './welcome-tour/tour-launch';
import WpcomNux from './welcome-modal/wpcom-nux';
import { DEFAULT_VARIANT, BLANK_CANVAS_VARIANT } from './store';

registerPlugin( 'wpcom-block-editor-nux', {
	render: function WpcomBlockEditorNux() {
		const { show, isLoaded, variant, isManuallyOpened, isNewPageLayoutModalOpen } = useSelect(
			( select ) => {
				const welcomeGuideStoreSelect = select( 'automattic/wpcom-welcome-guide' );
				const starterPageLayoutsStoreSelect = select( 'automattic/starter-page-layouts' );
				return {
					show: welcomeGuideStoreSelect.isWelcomeGuideShown(),
					isLoaded: welcomeGuideStoreSelect.isWelcomeGuideStatusLoaded(),
					variant: welcomeGuideStoreSelect.getWelcomeGuideVariant(),
					isManuallyOpened: welcomeGuideStoreSelect.isWelcomeGuideManuallyOpened(),
					isNewPageLayoutModalOpen: starterPageLayoutsStoreSelect?.isOpen(), // Handle the case where SPT is not initalized.
				};
			},
			[]
		);

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
					<LaunchWpcomWelcomeTour />;
				</LocaleProvider>
			);
		}

		if ( variant === 'modal' && Guide && GuidePage ) {
			return <WpcomNux />;
		}

		return null;
	},
} );
