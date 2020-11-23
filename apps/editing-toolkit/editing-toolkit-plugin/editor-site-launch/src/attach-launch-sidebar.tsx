/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';
import { doAction, hasAction } from '@wordpress/hooks';
import { LaunchContext } from '@automattic/launch';
import { LocaleProvider } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import LaunchModal from './launch-modal';
import { LAUNCH_STORE } from './stores';
import { FLOW_ID } from './constants';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-site-launch', {
	render: function LaunchSidebar() {
		const { isSidebarOpen } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
		const { closeSidebar, setSidebarFullscreen, unsetSidebarFullscreen } = useDispatch(
			LAUNCH_STORE
		);

		React.useEffect( () => {
			// @automattic/viewport doesn't have a breakpoint for medium (782px)
			window.innerWidth < 782 ? setSidebarFullscreen() : unsetSidebarFullscreen();
		}, [ isSidebarOpen, setSidebarFullscreen, unsetSidebarFullscreen ] );

		React.useEffect( () => {
			const TOGGLE_INLINE_HELP_BUTTON_ACTION = 'a8c.wpcom-block-editor.toggleInlineHelpButton';
			if ( hasAction( TOGGLE_INLINE_HELP_BUTTON_ACTION ) ) {
				doAction( TOGGLE_INLINE_HELP_BUTTON_ACTION, { hidden: isSidebarOpen } );
			}
		}, [ isSidebarOpen ] );

		if ( ! isSidebarOpen ) {
			return null;
		}

		return (
			<LocaleProvider localeSlug={ window.wpcomEditorSiteLaunch?.locale }>
				<LaunchContext.Provider value={ { siteId: window._currentSiteId, flow: FLOW_ID } }>
					<LaunchModal onClose={ closeSidebar } />
				</LaunchContext.Provider>
			</LocaleProvider>
		);
	},
} );
