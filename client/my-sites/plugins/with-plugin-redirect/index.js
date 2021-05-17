/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	isPluginActionCompleted,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { successNotice, removeNotice } from 'calypso/state/notices/actions';
import { getRedirectPluginHandler } from './utils';

const withPluginRedirect = createHigherOrderComponent(
	( Component ) => ( props ) => {
		const { plugin } = props;
		if ( ! plugin?.slug ) {
			return <Component { ...props } />;
		}

		const { slug: pluginSlug } = plugin;

		/*
		 * Store if the site was in a processing state.
		 * For Jetpack sites, it means the site was installing a plugin.
		 * For Atomic sites, it was transferring the site.
		 */
		const [ prevProcessingState, setPrevProcessingState ] = useState( 'init' );
		const [ shouldRedirect, setShouldRedirect ] = useState( false );

		const translate = useTranslate();
		const dispatch = useDispatch();

		const redirectHandler = getRedirectPluginHandler( pluginSlug );
		if ( ! redirectHandler ) {
			return <Component { ...props } />;
		}

		// Select data to detect the installing-plugin/transferring site state.
		const {
			transferringStatus,
			isInstallingPlugin,
			hasPluginBeenInstalled,
			isAtomic,
			isJetpack,
			isSiteConnected,
			redirectUrl,
		} = useSelector( ( state ) => {
			const siteId = getSelectedSiteId( state );
			return {
				transferringStatus: getAutomatedTransferStatus( state, siteId ),
				isInstallingPlugin: isPluginActionInProgress( state, siteId, pluginSlug, INSTALL_PLUGIN ),
				hasPluginBeenInstalled: isPluginActionCompleted(
					state,
					siteId,
					pluginSlug,
					INSTALL_PLUGIN
				),
				isAtomic: isSiteAutomatedTransfer( state, siteId ),
				isJetpack: isJetpackSite( state, siteId ),
				isSiteConnected: getSiteConnectionStatus( state, siteId ),
				redirectUrl: redirectHandler?.getUrl( state, siteId ),
			};
		} );

		// Define whether the site should redirect,
		// once the action is done (install plugin or transferring site)
		useEffect( () => {
			if ( ! isSiteConnected ) {
				return;
			}

			// Jetpack: Flag if the site was installing a plugin.
			if ( isJetpack && isInstallingPlugin && ! hasPluginBeenInstalled ) {
				setPrevProcessingState( 'plugin-installed' );
			}

			// Atomic: flag if the site was being transferred.
			if (
				isAtomic &&
				transferringStatus === transferStates.COMPLETE &&
				prevProcessingState === 'init'
			) {
				setPrevProcessingState( transferStates.COMPLETE );
			}

			if (
				( isJetpack && ! isInstallingPlugin && prevProcessingState === 'plugin-installed' ) || // <- Jetpack site.
				( isAtomic && prevProcessingState === transferStates.COMPLETE ) // <- Atomic site.
			) {
				return setShouldRedirect( redirectUrl );
			}

			setShouldRedirect( false );
		}, [
			isInstallingPlugin,
			hasPluginBeenInstalled,
			redirectUrl,
			transferringStatus,
			isJetpack,
			isAtomic,
			isSiteConnected,
			prevProcessingState,
		] );

		// Perform the client redirect,
		// cancelable by clickin on the cancel button.
		useEffect( () => {
			if ( ! shouldRedirect ) {
				return;
			}

			// For Atomic sites, we shoulnd't wait since
			// there is not a Notice about installing the plugin.
			const pluginInstalledNoticeTime = transferringStatus === transferStates.COMPLETE ? 100 : 3000;

			let timerId = setTimeout( () => {
				dispatch( removeNotice( 'plugin-notice' ) );

				// re-use same timer ID to redirect the client.
				timerId = setTimeout( () => {
					if ( ! window?.top.location.href ) {
						return;
					}

					return ( window.location.href = shouldRedirect );
				}, 6000 );

				const redirectMessage =
					redirectHandler.message ||
					translate( 'Redirecting to setup %{pluginName} in five seconds.', {
						args: {
							pluginName: redirectHandler.name,
						},
					} );

				dispatch(
					successNotice( redirectMessage, {
						button: translate( 'Cancel' ),
						id: 'plugin-redirect-notice',
						onClick: function () {
							timerId && window.clearTimeout( timerId );
							setPrevProcessingState( 'done' );
							setShouldRedirect( null );
							dispatch( removeNotice( 'plugin-redirect-notice' ) );
						},
					} )
				);
			}, pluginInstalledNoticeTime );

			return () => timerId && window.clearTimeout( timerId );
		}, [ shouldRedirect, redirectHandler, dispatch, translate, transferringStatus ] );

		return <Component { ...props } />;
	},
	'withPluginRedirect'
);

export default withPluginRedirect;
