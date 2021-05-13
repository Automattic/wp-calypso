/**
 * External dependencies
 */
import React from 'react';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';
import { useSelect, useDispatch } from '@wordpress/data';
import { hasQueryArg } from '@wordpress/url';
import FocusedLaunchModal from '@automattic/launch';

/**
 * Internal dependencies
 */
import { inIframe } from '../../block-inserter-modifications/contextual-tips/utils';
import { LAUNCH_STORE, SITE_STORE } from './stores';
import { openCheckout, redirectToWpcomPath, getCurrentLaunchFlowUrl } from './utils';
import { IMMEDIATE_LAUNCH_QUERY_ARG } from './constants';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-editor-focused-launch', {
	render: function LaunchSidebar() {
		const currentSiteId = window._currentSiteId;

		const isSiteLaunched = useSelect(
			( select ) => select( SITE_STORE ).isSiteLaunched( currentSiteId ),
			[ currentSiteId ]
		);

		const { isFocusedLaunchOpen, isAnchorFm } = useSelect(
			( select ) => select( LAUNCH_STORE ).getState(),
			[]
		);

		const { openFocusedLaunch } = useDispatch( LAUNCH_STORE );

		// Add a class to hide the Launch button from editor bar when site is launched
		React.useEffect( () => {
			if ( isSiteLaunched ) {
				document.body.classList.add( 'is-focused-launch-complete' );
			}
		}, [ isSiteLaunched ] );

		// '?should_launch' query arg is used when the mandatory checkout step
		// is redirecting to an external payment processing page (eg: Paypal)
		const shouldLaunch = hasQueryArg( getCurrentLaunchFlowUrl(), IMMEDIATE_LAUNCH_QUERY_ARG );

		React.useEffect( () => {
			if ( shouldLaunch && ! isSiteLaunched ) {
				openFocusedLaunch();
			}
		}, [ shouldLaunch, isSiteLaunched, openFocusedLaunch ] );

		return isFocusedLaunchOpen ? (
			<FocusedLaunchModal
				locale={ window.wpcomEditorSiteLaunch?.locale }
				openCheckout={ openCheckout }
				redirectTo={ redirectToWpcomPath }
				siteId={ currentSiteId }
				getCurrentLaunchFlowUrl={ getCurrentLaunchFlowUrl }
				isInIframe={ inIframe() }
				isLaunchImmediately={ shouldLaunch || isAnchorFm }
			/>
		) : null;
	},
} );
