/**
 * External dependencies
 */
import * as React from 'react';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';
import { useSelect } from '@wordpress/data';
import FocusedLaunchModal from '@automattic/launch';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, SITE_STORE } from './stores';
import { openCheckout, redirectToWpcomPath } from './utils';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-editor-focused-launch', {
	render: function LaunchSidebar() {
		const currentSiteId = window._currentSiteId;

		const [ isFocusedLaunchOpen, isSiteLaunched ] = useSelect( ( select ) => [
			select( LAUNCH_STORE ).isFocusedLaunchOpen(),
			select( SITE_STORE ).isSiteLaunched( currentSiteId ),
		] );

		// Add a class to hide the Launch button from editor bar when site is launched
		React.useEffect( () => {
			if ( isSiteLaunched ) {
				document.body.classList.add( 'is-focused-launch-complete' );
			}
		}, [ isSiteLaunched ] );

		if ( ! isFocusedLaunchOpen ) {
			return null;
		}

		return (
			<FocusedLaunchModal
				locale={ window.wpcomEditorSiteLaunch?.locale }
				openCheckout={ openCheckout }
				redirectTo={ redirectToWpcomPath }
				siteId={ currentSiteId }
			/>
		);
	},
} );
