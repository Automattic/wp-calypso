/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';
import FocusedLaunchModal from '@automattic/launch';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from './stores';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-editor-focused-launch', {
	render: function LaunchSidebar() {
		const { isFocusedLaunchOpen } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
		const { closeFocusedLaunch } = useDispatch( LAUNCH_STORE );

		if ( ! isFocusedLaunchOpen ) {
			return null;
		}

		return <FocusedLaunchModal siteId={ window._currentSiteId } onClose={ closeFocusedLaunch } />;
	},
} );
