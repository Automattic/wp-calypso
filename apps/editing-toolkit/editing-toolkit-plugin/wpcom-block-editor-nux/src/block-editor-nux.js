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
import LaunchWpcomWelcomeTour from './welcome-tour/tour-launch';
import WpcomNux from './welcome-modal/wpcom-nux';

registerPlugin( 'wpcom-block-editor-nux', {
	render: function WpcomBlockEditorNux() {
		const { showOnboarding, isNewPageLayoutModalOpen, isLoaded, variant } = useSelect(
			( select ) => ( {
				showOnboarding: select( 'automattic/nux' ).isWpcomNuxEnabled(),
				isLoaded: select( 'automattic/nux' ).isWpcomNuxStatusLoaded(),
				variant: select( 'automattic/nux' ).wpcomNuxVariant(),
				isNewPageLayoutModalOpen:
					select( 'automattic/starter-page-layouts' ) && // Handle the case where SPT is not initalized.
					select( 'automattic/starter-page-layouts' ).isOpen(),
			} )
		);

		const { setWpcomNuxStatus, setWpcomNuxVariant } = useDispatch( 'automattic/nux' );

		// On mount check if the WPCOM NUX status exists in state, otherwise fetch it from the API.
		useEffect( () => {
			if ( isLoaded ) {
				return;
			}

			const fetchWpcomNuxStatus = async () => {
				const response = await apiFetch( { path: '/wpcom/v2/block-editor/nux' } );
				setWpcomNuxStatus( { isNuxEnabled: response.show_editor_onboarding, bypassApi: true } );
				setWpcomNuxVariant( response.editor_onboarding_variant );
			};

			fetchWpcomNuxStatus();
		}, [ isLoaded, setWpcomNuxStatus, setWpcomNuxVariant ] );

		if ( ! showOnboarding || isNewPageLayoutModalOpen ) {
			return null;
		}

		if ( variant === 'tour' ) {
			return <LaunchWpcomWelcomeTour />;
		}

		if ( variant === 'modal' && Guide && GuidePage ) {
			return <WpcomNux />;
		}

		return null;
	},
} );
