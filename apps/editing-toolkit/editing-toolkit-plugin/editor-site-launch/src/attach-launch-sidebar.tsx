import { LocaleProvider, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';
import { LaunchContext } from '@automattic/launch';
import { useDispatch, useSelect } from '@wordpress/data';
import { doAction, hasAction } from '@wordpress/hooks';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';
import { useEffect } from 'react';
import { inIframe } from '../../block-inserter-modifications/contextual-tips/utils';
import { FLOW_ID } from './constants';
import LaunchModal from './launch-modal';
import { LAUNCH_STORE } from './stores';
import { openCheckout, redirectToWpcomPath, getCurrentLaunchFlowUrl } from './utils';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-site-launch', {
	render: function LaunchSidebar() {
		const { isSidebarOpen } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
		const { closeSidebar, setSidebarFullscreen, unsetSidebarFullscreen } = useDispatch(
			LAUNCH_STORE
		);

		useEffect( () => {
			// @automattic/viewport doesn't have a breakpoint for medium (782px)
			window.innerWidth < 782 ? setSidebarFullscreen() : unsetSidebarFullscreen();
		}, [ isSidebarOpen, setSidebarFullscreen, unsetSidebarFullscreen ] );

		useEffect( () => {
			const TOGGLE_INLINE_HELP_BUTTON_ACTION = 'a8c.wpcom-block-editor.toggleInlineHelpButton';
			if ( hasAction( TOGGLE_INLINE_HELP_BUTTON_ACTION ) ) {
				doAction( TOGGLE_INLINE_HELP_BUTTON_ACTION, { hidden: isSidebarOpen } );
			}
		}, [ isSidebarOpen ] );

		if ( ! isSidebarOpen ) {
			return null;
		}

		return (
			<LocaleProvider localeSlug={ window.wpcomEditorSiteLaunch?.locale ?? i18nDefaultLocaleSlug }>
				<LaunchContext.Provider
					value={ {
						siteId: window._currentSiteId,
						flow: FLOW_ID,
						redirectTo: redirectToWpcomPath,
						openCheckout,
						getCurrentLaunchFlowUrl,
						isInIframe: inIframe(),
					} }
				>
					<LaunchModal onClose={ closeSidebar } />
				</LaunchContext.Provider>
			</LocaleProvider>
		);
	},
} );
