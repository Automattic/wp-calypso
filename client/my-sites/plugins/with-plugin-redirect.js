/**
 * External dependencies
 */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate, translate as __ } from 'i18n-calypso';
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

// List of plugins that should perform a redirect
// once it's installed.
const redirectingPluginsList = {
	woocommerce: {
		name: 'WooCommerce',
		message: __( 'Redirecting to setup WooCommerce in five seconds.' ),
		handler: getSiteWoocommerceWizardUrl,
	},
};

/**
 * Return the redirec plugin object.
 *
 * @param {string} slug - Plugin slug.
 * @returns {object|boolean} Plugin redirect object. Otherwise, False.
 */

function getPluginRedirect( slug ) {
	if ( ! redirectingPluginsList.hasOwnProperty( slug ) ) {
		return false;
	}

	return redirectingPluginsList[ slug ];
}

const withPluginRedirect = createHigherOrderComponent(
	( Component ) => ( props ) => {
		const { plugin } = props;

		if ( ! plugin?.slug ) {
			return <Component { ...props } />;
		}

		const pluginSlug = plugin.slug;
		const redirectPlugin = getPluginRedirect( pluginSlug );
		if ( ! redirectPlugin ) {
			return <Component { ...props } />;
		}

		const wasInstalling = useRef();
		const [ redirectTo, setRedirectTo ] = useState( false );

		const translate = useTranslate();
		const dispatch = useDispatch();

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

				const isInstalling = isPluginActionInProgress( state, siteId, pluginSlug, INSTALL_PLUGIN );
				const hasBeenInstalled = isPluginActionCompleted(
					state,
					siteId,
					pluginSlug,
					INSTALL_PLUGIN
				);

				return {
					hasSiteBeenTransferred: transferState === transferStates?.COMPLETE,
					isInstallingPlugin: isInstalling,
					hasPluginBeenInstalled: hasBeenInstalled,
					isAtomic: isSiteAutomatedTransfer( state, siteId ),
					isJetpack: isJetpackSite( state, siteId ),
					isSiteConnected: getSiteConnectionStatus( state, siteId ),
					redirectUrl: redirectPlugin.handler( state, siteId ),
				};
			},
			[ pluginSlug ]
		);

		useEffect( () => {
			if ( ! isSiteConnected ) {
				return;
			}

			// Store the previous state of `isInstalling`.
			if ( isJetpack && isInstallingPlugin ) {
				wasInstalling.current = true;
			}

			// Store the previous state of `isInstalling`.
			if ( isAtomic && hasSiteBeenTransferred ) {
				wasInstalling.current = true;
			}

			if (
				( isJetpack && ! isInstallingPlugin && wasInstalling.current ) || // <- Jetpack site.
				( isAtomic && ! hasSiteBeenTransferred && wasInstalling.current ) // <- Atomic site.
			) {
				setRedirectTo( redirectUrl );
			}
		}, [
			isInstallingPlugin,
			hasPluginBeenInstalled,
			redirectUrl,
			hasSiteBeenTransferred,
			isJetpack,
			isAtomic,
			isSiteConnected,
		] );

		useEffect( () => {
			if ( ! redirectTo ) {
				return;
			}

			// For Atomic sites, we shoulnd't wait since
			/// there is not a Notice.
			const pluginInstalledNoticeTime = hasSiteBeenTransferred ? 0 : 3000;

			let timerId = setTimeout( () => {
				dispatch( removeNotice( 'plugin-notice' ) );

				// re-use same timer ID to redirect the client.
				timerId = setTimeout( () => {
					window.location.href = redirectTo;
				}, 5500 );

				const redirectMessage =
					redirectPlugin.message ||
					translate( 'Redirecting to setup %{pluginName} in five seconds.', {
						args: {
							pluginName: redirectPlugin.name,
						},
					} );

				dispatch(
					successNotice( redirectMessage, {
						duration: 5000,
						button: translate( 'Cancel' ),
						id: 'plugin-redirect-notice',
						onClick: function () {
							timerId && window.clearTimeout( timerId );
							dispatch( removeNotice( 'plugin-redirect-notice' ) );
						},
					} )
				);
			}, pluginInstalledNoticeTime );

			return function () {
				timerId && window.clearTimeout( timerId );
			};
		}, [ redirectTo, redirectPlugin, dispatch, translate, hasSiteBeenTransferred ] );

		return <Component { ...props } />;
	},
	'withPluginRedirect'
);

export default withPluginRedirect;
