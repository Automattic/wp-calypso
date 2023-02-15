import config from '@automattic/calypso-config';
import { isWooExpressFlow } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';

export interface Plugin {
	slug: string;
}

export interface PluginsResponse {
	plugins: Plugin[];
}

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
}

export const installedStates = {
	PENDING: 'pending',
	INSTALLED: 'installed',
	ERROR: 'error',
} as const;

const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

const WaitForPluginInstall: Step = function WaitForAtomic( { navigation, data, flow } ) {
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const siteId = data?.siteId;
	const siteSlug = data?.siteSlug;

	const handlePluginCheckFailure = ( failureInfo: FailureInfo ) => {
		recordTracksEvent( 'calypso_stepper_plugin_check_error', {
			action: failureInfo.type,
			site: siteId,
			code: failureInfo.code,
			error: failureInfo.error,
		} );

		logToLogstash( {
			feature: 'calypso_client',
			message: failureInfo.error,
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			blog_id: siteId,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_stepper_plugin_check_error',
				action: failureInfo.type,
				site: siteId,
				code: failureInfo.code,
			},
		} );
	};

	useEffect( () => {
		if ( ! siteId || ! siteSlug ) {
			return;
		}

		setPendingAction( async () => {
			const startTime = new Date().getTime();
			const totalTimeout = 1000 * 300;
			const maxFinishTime = startTime + totalTimeout;

			// Poll for transfer status
			let stopPollingPlugins = false;

			while ( ! stopPollingPlugins ) {
				await wait( 3000 );

				try {
					const response: PluginsResponse = await wpcomRequest( {
						path: `/sites/${ siteId }/plugins`,
						apiVersion: '1.1',
					} );

					// For WooExpress, we need to check for the WooCommerce plugin.
					if ( response?.plugins && isWooExpressFlow( flow ) ) {
						const woocommercePlugin = response?.plugins.find(
							( plugin: { slug: string } ) => plugin.slug === 'woocommerce'
						);

						if ( woocommercePlugin ) {
							stopPollingPlugins = true;
						}
					}
				} catch ( err ) {
					// Ignore errors. It's normal to get errors the first couple of times we poll. The timeout will eventually catch it if the failures continue.
				}

				if ( maxFinishTime < new Date().getTime() ) {
					handlePluginCheckFailure( {
						type: 'plugin_check_timeout',
						error: 'plugin check took too long',
						code: 'plugin_check_timeout',
					} );
					throw new Error( 'plugin check timeout' );
				}
			}

			return { pluginsInstalled: true, siteSlug, siteId };
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId ] );

	return null;
};

export default WaitForPluginInstall;
