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
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import WpcomNux from './welcome-modal/wpcom-nux';
import LaunchWpcomWelcomeTour from './welcome-tour/tour-launch';

registerPlugin( 'wpcom-block-editor-nux', {
	render: function WpcomBlockEditorNux() {
		const { site, isWpcomNuxEnabled, showWpcomGuideVariant, isSPTOpen } = useSelect(
			( select ) => ( {
				site: select( 'automattic/site' ).getSite( window._currentSiteId ),
				isWpcomNuxEnabled: select( 'automattic/nux' ).isWpcomNuxEnabled(),
				showWpcomGuideVariant: select( 'automattic/nux' ).shouldShowWpcomGuideVariant(),
				isSPTOpen:
					select( 'automattic/starter-page-layouts' ) && // Handle the case where SPT is not initalized.
					select( 'automattic/starter-page-layouts' ).isOpen(),
			} )
		);

		const { setWpcomNuxStatus, setShouldShowWpcomGuideVariant } = useDispatch( 'automattic/nux' );

		// On mount check if the WPCOM NUX status exists in state, otherwise fetch it from the API.
		useEffect( () => {
			if ( typeof isWpcomNuxEnabled !== 'undefined' ) {
				return;
			}

			const fetchWpcomNuxStatus = async () => {
				const response = await apiFetch( { path: '/wpcom/v2/block-editor/nux' } );
				setWpcomNuxStatus( { isNuxEnabled: response.is_nux_enabled, bypassApi: true } );
				setShouldShowWpcomGuideVariant( { showVariant: response.welcome_guide_show_variant } );
			};

			fetchWpcomNuxStatus();
		}, [ isWpcomNuxEnabled, setWpcomNuxStatus, setShouldShowWpcomGuideVariant ] );

		if ( ! isWpcomNuxEnabled || isSPTOpen ) {
			return null;
		}

		const isPodcastingSite = !! site?.options?.anchor_podcast;

		if ( showWpcomGuideVariant && ! isPodcastingSite ) {
			return <LaunchWpcomWelcomeTour />;
		}

		if ( Guide && GuidePage ) {
			return <WpcomNux />;
		}

		return null;
	},
} );
