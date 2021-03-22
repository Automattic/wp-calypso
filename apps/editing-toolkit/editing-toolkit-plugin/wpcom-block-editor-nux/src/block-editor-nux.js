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

/**
 * Internal dependencies
 */
import LaunchWpcomWelcomeTour from './welcome-tour/tour-launch';
import WpcomNux from './welcome-modal/wpcom-nux';

registerPlugin( 'wpcom-block-editor-nux', {
	render: function WpcomBlockEditorNux() {
		const { show, isNewPageLayoutModalOpen, isLoaded, variant } = useSelect( ( select ) => ( {
			show: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideShown(),
			isLoaded: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideStatusLoaded(),
			variant: select( 'automattic/wpcom-welcome-guide' ).getWelcomeGuideVariant(),
			isNewPageLayoutModalOpen:
				select( 'automattic/starter-page-layouts' ) && // Handle the case where SPT is not initalized.
				select( 'automattic/starter-page-layouts' ).isOpen(),
		} ) );

		const { fetchWelcomeGuideStatus } = useDispatch( 'automattic/wpcom-welcome-guide' );

		// On mount check if the WPCOM welcome guide status exists in state, otherwise fetch it from the API.
		useEffect( () => {
			if ( ! isLoaded ) {
				fetchWelcomeGuideStatus();
			}
		}, [ fetchWelcomeGuideStatus, isLoaded ] );

		if ( ! show || isNewPageLayoutModalOpen ) {
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
