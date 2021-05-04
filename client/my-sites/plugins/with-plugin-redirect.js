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

		/*
		 * Store if the site was in a processing state.
		 * For Jetpack sites, it means the site was installing a plugin.
		 * For Atomic sites, it was transferring the site.
		 */
		const [ prevProcessingState, setPrevProcessingState ] = useState( 'init' );
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
			transferringStatus,
			hasPluginBeenInstalled,
			isInstallingPlugin,
			isJetpack,
			isAtomic,
			isSiteConnected,
			redirectUrl,
		} = useSelector(
			( state ) => {
				const siteId = getSelectedSiteId( state );

				// transferStates.COMPLETE
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
				return setRedirectTo( redirectUrl );
			}

			setRedirectTo( false );
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

		useEffect( () => {
			if ( ! redirectTo ) {
				return;
			}

			// For Atomic sites, we shoulnd't wait since
			// there is not a Notice about installing the plugin.
			const pluginInstalledNoticeTime = transferringStatus ? 100 : 3000;

			let timerId = setTimeout( () => {
				dispatch( removeNotice( 'plugin-notice' ) );

				// re-use same timer ID to redirect the client.
				timerId = setTimeout( () => {
					if ( ! window?.top.location.href ) {
						return;
					}

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
							setPrevProcessingState( 'done' );
							setRedirectTo( null );
							dispatch( removeNotice( 'plugin-redirect-notice' ) );
						},
					} )
				);
			}, pluginInstalledNoticeTime );

			return () => timerId && window.clearTimeout( timerId );
		}, [ redirectTo, redirectPlugin, dispatch, translate, transferringStatus ] );

		return <Component { ...props } />;
	},
	'withPluginRedirect'
);

export default withPluginRedirect;
