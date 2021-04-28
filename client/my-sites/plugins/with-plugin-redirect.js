/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isJetpackSite, getSiteWoocommerceWizardUrl } from 'calypso/state/sites/selectors';
import { isPluginActionCompleted } from 'calypso/state/plugins/installed/selectors';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { successNotice, removeNotice } from 'calypso/state/notices/actions';

const withPluginRedirect = ( Component ) => ( props ) => {
	const { plugin = {} } = props;
	const pluginSlug = plugin?.slug;

	if ( ! pluginSlug ) {
		return <Component { ...props } />;
	}

	const translate = useTranslate();
	const dispatch = useDispatch();

	const { redirect, url, hasSiteBeenTransferred } = useSelector(
		( state ) => {
			const site = getSelectedSite( state );
			const isAtomic = isSiteAutomatedTransfer( state, site.ID );
			const isJetpack = isJetpackSite( state, site.ID );
			const woocommerceWizardUrl = getSiteWoocommerceWizardUrl( state, site.ID );
			const transferState = getAutomatedTransferStatus( state, site.ID );
			const hasPluginJustBeenInstalled = isPluginActionCompleted(
				state,
				site.ID,
				pluginSlug,
				INSTALL_PLUGIN
			);

			const isSiteConnected = getSiteConnectionStatus( state, site.ID );
			const selectedData = {
				redirect: false,
				url: woocommerceWizardUrl,
				hasSiteBeenTransferred: transferState === transferStates?.COMPLETE,
			};

			// Jetpack site.
			if (
				isJetpack &&
				pluginSlug === 'woocommerce' &&
				woocommerceWizardUrl &&
				hasPluginJustBeenInstalled &&
				isSiteConnected
			) {
				return { ...selectedData, redirect: true };
			}

			// Atomic Site.
			if (
				isAtomic &&
				pluginSlug === 'woocommerce' &&
				woocommerceWizardUrl &&
				selectedData.hasSiteBeenTransferred &&
				isSiteConnected
			) {
				return { ...selectedData, redirect: true };
			}

			return selectedData;
		},
		[ pluginSlug ]
	);

	const pluginName = plugin?.name;

	useEffect( () => {
		if ( ! redirect || ! url || ! pluginName ) {
			return;
		}

		const pluginInstalledNoticeTime = hasSiteBeenTransferred ? 0 : 3000;

		let timerId = setTimeout( () => {
			dispatch( removeNotice( 'plugin-notice' ) );

			// re-use same timer ID.
			timerId = setTimeout( () => {
				window.location.href = url;
			}, 5000 );

			dispatch(
				successNotice(
					translate( 'Redirecting to the %(pluginName)s onborading page in five seconds.', {
						args: {
							pluginName,
						},
					} ),
					{
						duration: 5000,
						button: translate( 'Cancel' ),
						id: 'plugin-redirect-notice',
						onClick: function () {
							timerId && window.clearTimeout( timerId );
							dispatch( removeNotice( 'plugin-redirect-notice' ) );
						},
					}
				)
			);
		}, pluginInstalledNoticeTime );

		return function () {
			timerId && window.clearTimeout( timerId );
		};
	}, [ redirect, url, pluginName, dispatch, translate, hasSiteBeenTransferred ] );

	return <Component { ...props } />;
};

export default withPluginRedirect;
