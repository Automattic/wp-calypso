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
import { isJetpackSite, getSiteWoocommerceWizardUrl } from 'calypso/state/sites/selectors';
import {
	isPluginActionCompleted,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { successNotice, removeNotice } from 'calypso/state/notices/actions';

const withPluginRedirect = createHigherOrderComponent(
	( Component ) => ( props ) => {
		const { plugin } = props;

		if ( ! plugin?.slug ) {
			return <Component { ...props } />;
		}

		const [ wasInstalling, setWasInstalling ] = useState( false );
		const [ redirectTo, setRedirectTo ] = useState( null );

		const translate = useTranslate();
		const dispatch = useDispatch();

		/*
		 * List of plugins that should perform a redirect
		 * once it's installed.
		 */
		const redirectingPluginsList = {
			woocommerce: {
				name: 'WooCommerce',
				message: translate( 'Redirecting to setup WooCommerce in five seconds.' ),
				getUrl: getSiteWoocommerceWizardUrl,
			},
		};

		/**
		 * Helper - return the redirect plugin object.
		 *
		 * @param {string} slug - Plugin slug.
		 * @returns {object|boolean} Plugin redirect object. Otherwise, False.
		 */
		function getPluginRedirectHandler( slug ) {
			if ( ! redirectingPluginsList.hasOwnProperty( slug ) ) {
				return false;
			}

			return redirectingPluginsList[ slug ];
		}

		const pluginSlug = plugin.slug;
		const redirectPlugin = getPluginRedirectHandler( pluginSlug );
		if ( ! redirectPlugin ) {
			return <Component { ...props } />;
		}

		const {
			hasSiteBeenTransferred,
			hasPluginBeenInstalled,
			isInstallingPlugin,
			isJetpack,
			isAtomic,
			isSiteConnected,
			redirectUrl,
		} = useSelector(
			( state ) => {
				const siteId = getSelectedSiteId( state );
				const transferState = getAutomatedTransferStatus( state, siteId );

				return {
					hasSiteBeenTransferred: transferState === transferStates.COMPLETE,
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
					redirectUrl: redirectPlugin.getUrl( state, siteId ),
				};
			},
			[ pluginSlug ]
		);

		// Stores the previous state of plugin install.
		useEffect( () => {
			if ( ! isSiteConnected ) {
				return;
			}

			// Store the previous state of `isInstalling`.
			if ( isJetpack && isInstallingPlugin ) {
				setWasInstalling( true );
			}

			if (
				( isJetpack && ! isInstallingPlugin && wasInstalling ) || // <- Jetpack site.
				( isAtomic && ! hasSiteBeenTransferred && wasInstalling ) // <- Atomic site.
			) {
				return setRedirectTo( redirectUrl );
			}

			setRedirectTo( false );
		}, [
			isInstallingPlugin,
			hasPluginBeenInstalled,
			redirectUrl,
			hasSiteBeenTransferred,
			isJetpack,
			isAtomic,
			isSiteConnected,
			wasInstalling,
		] );

		useEffect( () => {
			if ( ! redirectTo ) {
				return;
			}

			// For Atomic sites, we shoulnd't wait since
			// there is not a Notice about installing the plugin.
			const pluginInstalledNoticeTime = hasSiteBeenTransferred ? 0 : 3000;

			let timerId = setTimeout( () => {
				dispatch( removeNotice( 'plugin-notice' ) );

				// re-use same timer ID to redirect the client.
				timerId = setTimeout( () => {
					window.location.href = redirectTo;
				}, 6000 );

				const redirectMessage =
					redirectPlugin.message ||
					translate( 'Redirecting to setup %{pluginName} in five seconds.', {
						args: {
							pluginName: redirectPlugin.name,
						},
					} );

				dispatch(
					successNotice( redirectMessage, {
						button: translate( 'Cancel' ),
						id: 'plugin-redirect-notice',
						onClick: function () {
							timerId && window.clearTimeout( timerId );
							setWasInstalling( false );
							setRedirectTo( null );
							dispatch( removeNotice( 'plugin-redirect-notice' ) );
						},
					} )
				);
			}, pluginInstalledNoticeTime );

			return () => timerId && window.clearTimeout( timerId );
		}, [ redirectTo, redirectPlugin, dispatch, translate, hasSiteBeenTransferred ] );

		return <Component { ...props } />;
	},
	'withPluginRedirect'
);

export default withPluginRedirect;
