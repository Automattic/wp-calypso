/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import { Guide, GuidePage } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import LaunchWpcomWelcomeTour from './welcome-tour/tour-launch';
import WpcomNux from './welcome-modal/wpcom-nux';

registerPlugin( 'wpcom-block-editor-nux', {
	render: function WpcomBlockEditorNux() {
		const [ isMobileDevice, setIsMobileDevice ] = useState();
		const { isWpcomNuxEnabled, isSPTOpen } = useSelect( ( select ) => ( {
			isWpcomNuxEnabled: select( 'automattic/nux' ).isWpcomNuxEnabled(),
			isSPTOpen:
				select( 'automattic/starter-page-layouts' ) && // Handle the case where SPT is not initalized.
				select( 'automattic/starter-page-layouts' ).isOpen(),
		} ) );

		const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

		// On mount check if the WPCOM NUX status exists in state, otherwise fetch it from the API.
		useEffect( () => {
			if ( typeof isWpcomNuxEnabled !== 'undefined' && typeof isMobileDevice !== 'undefined' ) {
				return;
			}

			const fetchWpcomNuxStatus = async () => {
				const response = await apiFetch( { path: '/wpcom/v2/block-editor/nux' } );
				setWpcomNuxStatus( { isNuxEnabled: response.is_nux_enabled, bypassApi: true } );
				setIsMobileDevice( response.is_mobile_device );
			};

			fetchWpcomNuxStatus();
		}, [ isWpcomNuxEnabled, setWpcomNuxStatus, isMobileDevice ] );

		if ( ! isWpcomNuxEnabled || isSPTOpen || typeof isMobileDevice === 'undefined' ) {
			return null;
		}

		if ( isMobileDevice && Guide && GuidePage ) {
			return <WpcomNux />;
		}

		return <LaunchWpcomWelcomeTour />;
	},
} );
