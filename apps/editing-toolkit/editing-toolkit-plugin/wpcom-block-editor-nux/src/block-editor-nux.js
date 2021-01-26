/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { Guide, GuidePage } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import WpcomNux from './src/welcome-modal/wpcom-nux';
import LaunchWpcomWelcomeTour from './src/welcome-tour/tour-launch';
import { getQueryArg } from '@wordpress/url';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

// Only register plugin if these features are available.
// If registered without this check, atomic sites without gutenberg enabled will error when loading the editor.
// These seem to be the only dependencies here that are not supported there.

registerPlugin( 'wpcom-block-editor-nux', {
	render: function WpcomBlockEditorNux() {
		const { site, isWpcomNuxEnabled, showWpcomNuxVariant } = useSelect( ( select ) => ( {
			site: select( 'automattic/site' ).getSite( window._currentSiteId ),
			isWpcomNuxEnabled: select( 'automattic/nux' ).isWpcomNuxEnabled(),
			showWpcomNuxVariant: select( 'automattic/nux' ).shouldShowWpcomNuxVariant(),
		} ) );

		const { setWpcomNuxStatus, setShowWpcomNuxVariant } = useDispatch( 'automattic/nux' );

		// On mount check if the WPCOM NUX status exists in state, otherwise fetch it from the API.
		useEffect( () => {
			if ( typeof isWpcomNuxEnabled !== 'undefined' ) {
				return;
			}

			const fetchWpcomNuxStatus = async () => {
				const response = await apiFetch( { path: '/wpcom/v2/block-editor/nux' } );
				setWpcomNuxStatus( { isNuxEnabled: response.is_nux_enabled, bypassApi: true } );
				setShowWpcomNuxVariant( { showVariant: response.welcome_tour_show_variant } );
			};

			fetchWpcomNuxStatus();
		}, [ isWpcomNuxEnabled, setWpcomNuxStatus ] );

		const isPodcastingSite = !! site?.options?.anchor_podcast;
		const anchorEpisode = getQueryArg( window.location.href, 'anchor_episode' );
		const showPodcastingTutorial = isPodcastingSite && anchorEpisode;

		if ( showWpcomNuxVariant && ! showPodcastingTutorial ) {
			return <LaunchWpcomWelcomeTour />;
		}

		if ( Guide && GuidePage ) {
			return <WpcomNux />;
		}

		return null;
	},
} );
