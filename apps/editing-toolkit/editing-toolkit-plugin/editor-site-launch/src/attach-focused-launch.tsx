/**
 * External dependencies
 */
import * as React from 'react';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';
import FocusedLaunchModal, { useFocusedLaunchModal } from '@automattic/launch';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-editor-focused-launch', {
	render: function LaunchSidebar() {
		const { isFocusedLaunchOpen, closeFocusedLaunch } = useFocusedLaunchModal();

		if ( ! isFocusedLaunchOpen ) {
			return null;
		}

		return (
			<FocusedLaunchModal
				siteId={ window._currentSiteId }
				onClose={ closeFocusedLaunch }
				locale={ document.documentElement.lang }
				redirectTo={ ( path: string ) => {
					// @TODO: rewrite so that the "wordpress.com" doesn't have
					// to be hardcoded
					window.top.location.href = `https://wordpress.com${
						path.startsWith( '/' ) ? path : `/${ path }`
					}`;
				} }
			/>
		);
	},
} );
