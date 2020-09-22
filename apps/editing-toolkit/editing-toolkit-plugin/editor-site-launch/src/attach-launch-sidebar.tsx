/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import LaunchModal from './launch-modal';
import { useOnLaunch } from './hooks';
import { LAUNCH_STORE } from './stores';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-site-launch', {
	render: function LaunchSidebar() {
		const { isSidebarOpen } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
		const { closeSidebar, setSidebarFullscreen, unsetSidebarFullscreen } = useDispatch(
			LAUNCH_STORE
		);

		// handle redirects to checkout / my home after launch
		useOnLaunch();

		React.useEffect( () => {
			// @automattic/viewport doesn't have a breakpoint for medium (782px)
			window.innerWidth < 782 ? setSidebarFullscreen() : unsetSidebarFullscreen();
		}, [ isSidebarOpen, setSidebarFullscreen, unsetSidebarFullscreen ] );

		if ( ! isSidebarOpen ) {
			return null;
		}

		return <LaunchModal onClose={ closeSidebar } />;
	},
} );
